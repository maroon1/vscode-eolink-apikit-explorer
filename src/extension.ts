import * as vscode from 'vscode';
import { ApikitTreeDataProvider } from './api-kit-tree-data-provider';
import { apiManager } from './api-manager';
import { setup } from './commands';
import { EolinkerApiTextDocumentContentProvider } from './eolinker-api-text-document-content-provider';
import {
  formatSourceCode,
  generateCode,
  insertSourceCode,
} from './source-generator';

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.workspace.registerTextDocumentContentProvider(
      EolinkerApiTextDocumentContentProvider.schema,
      new EolinkerApiTextDocumentContentProvider(),
    ),
  );

  const tree = new ApikitTreeDataProvider(context);

  context.subscriptions.push(
    vscode.window.registerTreeDataProvider('eolinkApikitExplorer', tree),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      'eolinkApikitExplorer.generateType',
      async (apiId: number) => {
        const data = await apiManager.getApiInfo(apiId);

        const uri = vscode.Uri.parse(
          `${EolinkerApiTextDocumentContentProvider.schema}:api.d.ts`,
        );

        const isNewDoc = vscode.workspace.textDocuments.every(
          (doc) => doc.fileName !== uri.path,
        );

        const doc = await vscode.workspace.openTextDocument(uri);

        const sourceCode = await generateCode(data.api_info);

        insertSourceCode(uri, doc, sourceCode);
        formatSourceCode(uri);

        const currentDoc = vscode.window.activeTextEditor;

        vscode.window.showTextDocument(doc, {
          preview: true,
          viewColumn:
            currentDoc === void 0
              ? vscode.ViewColumn.Active
              : isNewDoc
                ? vscode.ViewColumn.Beside
                : vscode.ViewColumn.Active,
        });
      },
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('eolinkApikitExplorer.setup', setup),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('eolinkApikitExplorer.refresh', () => {
      tree.refresh();
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
