import axios from 'axios';
import * as vscode from 'vscode';
import { z } from 'zod';
import { apiManager } from './api-manager';
import { setConfiguration } from './configuration';
import { ApiSettings } from './types';

export async function setup() {
  const settings = vscode.workspace
    .getConfiguration('eolinkApikitExplorer')
    .get<ApiSettings>('settings');

  const origin = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    title: 'Eolinker URL',
    prompt: '请输入 Eolinker 实例的 URL',
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

  const apiKey = await vscode.window.showInputBox({
    ignoreFocusOut: true,
    title: '个人访问令牌',
    prompt: '请输入 ApiKit OpenAPI 的个人访问令牌',
    value: settings?.apiKey,
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

  const workspace = await vscode.window.showQuickPick(workspaceItems, {
    ignoreFocusOut: true,
    title: '请选择工作空间',
  });

  if (!workspace) {
    return;
  }

  const projectItems = apiManager.getProjects(workspace.id).then((projects) =>
    projects.map<ProjectPickItem>((item) => ({
      id: item.project_id,
      label: item.project_name,
    })),
  );

  const project = await vscode.window.showQuickPick(projectItems, {
    ignoreFocusOut: true,
    title: '请选择项目',
  });

  if (!project) {
    return;
  }

  setConfiguration({
    origin,
    apiKey,
    workspaceId: workspace.id,
    projectId: project.id,
  });
}

interface WorkspacePickItem extends vscode.QuickPickItem {
  id: string;
}

interface ProjectPickItem extends vscode.QuickPickItem {
  id: string;
}
