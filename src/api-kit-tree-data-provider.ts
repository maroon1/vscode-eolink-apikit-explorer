import * as vscode from 'vscode';
import { z } from 'zod';
import { apiManager } from './api-manager';
import { ApiGroupItem, ApiListItem } from './api-types';
import { getConfiguration } from './configuration';
import { ApiGroupTreeItem, ApiTreeItem } from './tree-item';
import { ApiGroupTreeNode, ApiTreeNode, TreeNode } from './types';

export const apiSettingsSchema = z.object({
  origin: z.string().url(),
  apiKey: z.string(),
  workspaceId: z.string(),
  projectId: z.string(),
});

export class ApikitTreeDataProvider
  implements vscode.TreeDataProvider<TreeNode>
{
  #apiSubGroupMap = new Map<number, ApiGroupTreeNode[]>();

  #apiGroupMap = new Map<number, ApiGroupTreeNode>();

  #apiMap = new Map<number, ApiTreeNode[]>();

  #onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined | void> =
    new vscode.EventEmitter<TreeNode | undefined | void>();

  onDidChangeTreeData?:
    | vscode.Event<void | TreeNode | TreeNode[] | null | undefined>
    | undefined = this.#onDidChangeTreeData.event;

  constructor(context: vscode.ExtensionContext) {
    context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration((e) => {
        if (!e.affectsConfiguration('eolinkApikitExplorer.settings')) {
          return;
        }

        this.refresh();
      }),
    );
  }

  refresh() {
    this.#onDidChangeTreeData.fire();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element.type === 'group'
      ? new ApiGroupTreeItem(element)
      : new ApiTreeItem(element);
  }

  async getChildren(element?: TreeNode | undefined): Promise<TreeNode[]> {
    const settings = getConfiguration();

    const { success } = apiSettingsSchema.safeParse(settings);

    if (!success) {
      return [];
    }

    if (!element) {
      const tree = await apiManager.getApiGroupMap();
      const list = [...this.#toGroupList(tree)];
      this.#apiSubGroupMap = this.#toSubGroupMap(list);
      this.#apiGroupMap = this.#toGroupMap(list);

      return this.#apiSubGroupMap.get(0) ?? [];
    }

    if (element.type === 'group') {
      if (element.is_leaf) {
        if (this.#apiMap.size === 0) {
          try {
            const list = await apiManager.getApiList();
            this.#apiMap = this.#toApiGroupMap(list);
          } catch (error) {
            if (error instanceof Error) {
              vscode.window.showErrorMessage(error.message);
            } else {
              vscode.window.showErrorMessage('发生未知的错误');
            }

            return [];
          }
        }

        return this.#apiMap.get(element.group_id) ?? [];
      }
    }

    return this.#apiSubGroupMap.get(element.id) ?? [];
  }

  getParent?(element: TreeNode): vscode.ProviderResult<TreeNode> {
    return this.#apiGroupMap.get(element.group_id);
  }

  *#toGroupList(
    groupTree: ApiGroupItem[],
    level = 0,
  ): Generator<ApiGroupTreeNode> {
    for (const group of groupTree) {
      yield {
        group_id: group.group_id,
        group_name: group.group_name,
        id: group.group_id,
        name: group.group_name,
        type: 'group',
        parent_group_id: group.parent_group_id,
        is_leaf: !group.group_child_list?.length,
        level,
      };

      if (group.group_child_list) {
        yield* this.#toGroupList(group.group_child_list, level + 1);
      }
    }
  }

  #toGroupMap(groups: ApiGroupTreeNode[]) {
    const map = new Map<number, ApiGroupTreeNode>();

    for (const group of groups) {
      map.set(group.id, group);
    }

    return map;
  }

  #toSubGroupMap(groups: ApiGroupTreeNode[]) {
    const map = new Map<number, ApiGroupTreeNode[]>();

    for (const group of groups) {
      const subGroups = map.get(group.parent_group_id) ?? [];
      subGroups.push(group);
      map.set(group.parent_group_id, subGroups);
    }

    return map;
  }

  #toApiGroupMap(apis: ApiListItem[]) {
    const map = new Map<number, ApiTreeNode[]>();

    for (const api of apis) {
      const group = map.get(api.group_id) ?? [];

      group.push({
        id: api.api_id,
        name: api.api_name,
        type: 'api',
        ...api,
      });

      map.set(api.group_id, group);
    }

    return map;
  }
}
