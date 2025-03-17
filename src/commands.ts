import axios from 'axios';
import {
  commands,
  ExtensionContext,
  QuickPickItem,
  TreeView,
  window,
  workspace,
} from 'vscode';
import { z } from 'zod';
import { apiManager } from './api-manager';
import { setConfiguration } from './configuration';
import { ApiQuickPickItem, ApiSettings, TreeNode } from './types';

export async function setup() {
  const settings = workspace
    .getConfiguration('eolinkApikitExplorer')
    .get<ApiSettings>('settings');

  const origin = await window.showInputBox({
    ignoreFocusOut: true,
    title: 'Eolink Apikit API URL',
    prompt: '请输入 Eolink Apikit API URL',
    value: settings?.origin,
    valueSelection: [0, settings?.origin?.length ?? 0],
    validateInput: (value) => {
      const { success, error } = z
        .string()
        .url('请输入正确的 URL')
        .safeParse(value);
      return success ? void 0 : error.errors[0].message;
    },
  });

  if (!origin) {
    return;
  }

  const apiKey = await window.showInputBox({
    ignoreFocusOut: true,
    title: '个人访问令牌',
    prompt: '请输入 ApiKit OpenAPI 的个人访问令牌',
    value: settings?.apiKey,
    password: true,
    valueSelection: [0, settings?.apiKey?.length ?? 0],
  });

  if (!apiKey) {
    return;
  }

  axios.defaults.baseURL = origin;
  axios.defaults.headers.common['Eo-Secret-Key'] = apiKey;

  const workspaceItems = apiManager.getWorkspaces().then((workspaces) =>
    workspaces.map<WorkspacePickItem>((item) => ({
      id: item.space_id,
      label: item.space_name,
      description: item.space_introduce,
    })),
  );

  const apiWorkspace = await window.showQuickPick(workspaceItems, {
    ignoreFocusOut: true,
    title: '请选择工作空间',
  });

  if (!apiWorkspace) {
    return;
  }

  const projectItems = apiManager
    .getProjects(apiWorkspace.id)
    .then((projects) =>
      projects.map<ProjectPickItem>((item) => ({
        id: item.project_id,
        label: item.project_name,
      })),
    );

  const project = await window.showQuickPick(projectItems, {
    ignoreFocusOut: true,
    title: '请选择项目',
  });

  if (!project) {
    return;
  }

  setConfiguration({
    origin,
    apiKey,
    workspaceId: apiWorkspace.id,
    projectId: project.id,
  });
}

interface WorkspacePickItem extends QuickPickItem {
  id: string;
}

interface ProjectPickItem extends QuickPickItem {
  id: string;
}

export function registerSearchCommand(
  treeView: TreeView<TreeNode>,
  context: ExtensionContext,
) {
  async function search() {
    const picker = window.createQuickPick<ApiQuickPickItem>();
    picker.placeholder = '请输入接口地址或名称进行查询';
    picker.matchOnDescription = true;
    picker.matchOnDetail = true;
    picker.title = 'eolink Apikit 搜索';
    picker.busy = true;
    picker.show();

    const apis = await apiManager.getApiList();

    picker.busy = false;

    picker.items = apis.map((api) => ({
      label: api.api_name,
      description: api.creator,
      detail: `${api.method.toUpperCase()} ${api.api_path}`,
      api,
    }));

    picker.onDidAccept(() => {
      picker.hide();
      const selected = picker.selectedItems.at(0);

      if (!selected) {
        return;
      }

      treeView.reveal(
        {
          id: selected.api.api_id,
          name: selected.api.api_name,
          type: 'api',
          ...selected.api,
        },
        {
          expand: true,
          focus: true,
        },
      );
      commands.executeCommand(
        'eolinkApikitExplorer.generateType',
        selected.api.api_id,
      );
    });
  }

  context.subscriptions.push(
    commands.registerCommand('eolinkApikitExplorer.search', search),
  );
}

export function copy(content: string) {
  import('clipboardy')
    .then((m) => m.default.writeSync(content))
    .then(() => {
      window.showInformationMessage('代码已复制到剪贴板');
    });
}
