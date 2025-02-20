import { workspace } from 'vscode';
import { ApiSettings } from './types';

export function getConfiguration(): ApiSettings | undefined {
  return workspace.getConfiguration().get('eolinkApikitExplorer.settings');
}

export function setConfiguration(settings: ApiSettings | undefined): void {
  workspace
    .getConfiguration()
    .update('eolinkApikitExplorer.settings', settings, true);
}
