import { ThemeIcon, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { ApiGroupTreeNode, ApiTreeNode, TreeNode } from './types';

export class ApiGroupTreeItem extends TreeItem {
  constructor(node: ApiGroupTreeNode) {
    super(node.name, getCollapsibleState(node));

    this.id = getId(node);
    this.tooltip = 'ok';
    this.iconPath = ThemeIcon.Folder;
  }
}

export class ApiTreeItem extends TreeItem {
  constructor(node: ApiTreeNode) {
    super(node.name, getCollapsibleState(node));

    this.id = getId(node);
    this.description = `${node.method.toUpperCase()} ${node.api_path}`;
    this.command = {
      command: 'eolinkApikitExplorer.generateType',
      title: 'Show API',
      arguments: [node.api_id],
    };
    this.iconPath = new ThemeIcon('debug-disconnect');
  }
}

function getId(element: TreeNode) {
  return `${element.type}-${element.id}`;
}

function getCollapsibleState(element: TreeNode) {
  if (element.type === 'api') {
    return TreeItemCollapsibleState.None;
  }

  if (element.level === 0) {
    return TreeItemCollapsibleState.Expanded;
  }

  return TreeItemCollapsibleState.Collapsed;
}
