import {
  commands,
  ExtensionContext,
  languages,
  Uri,
  ViewColumn,
  window,
  workspace,
} from 'vscode';
import { apiManager } from './api-manager';
import { ApikitCodeLensProvider } from './apikit-codelens-provider';
import { ApikitTextDocumentContentProvider } from './apikit-text-document-content-provider';
import { ApikitTreeDataProvider } from './apikit-tree-data-provider';
import { copy, registerSearchCommand, setup } from './commands';
import {
  formatSourceCode,
  generateCode,
  insertSourceCode,
} from './source-generator';

export function activate(context: ExtensionContext) {
  context.subscriptions.push(
    workspace.registerTextDocumentContentProvider(
      ApikitTextDocumentContentProvider.schema,
      new ApikitTextDocumentContentProvider(),
    ),
  );

  const tree = new ApikitTreeDataProvider(context);

  const treeView = window.createTreeView('eolinkApikitExplorer', {
    treeDataProvider: tree,
  });

  context.subscriptions.push(
    window.registerTreeDataProvider('eolinkApikitExplorer', tree),
  );

  context.subscriptions.push(
    languages.registerCodeLensProvider(
      { scheme: ApikitTextDocumentContentProvider.schema },
      new ApikitCodeLensProvider(),
    ),
  );

  context.subscriptions.push(
    commands.registerCommand(
      'eolinkApikitExplorer.generateType',
      async (apiId: number) => {
        const data = await apiManager.getApiInfo(apiId);

        const uri = Uri.parse(
          `${ApikitTextDocumentContentProvider.schema}:api.d.ts`,
        );

        const isNewDoc = workspace.textDocuments.every(
          (doc) => doc.fileName !== uri.path,
        );

        const doc = await workspace.openTextDocument(uri);

        const sourceCode = await generateCode(data.api_info);

        insertSourceCode(uri, doc, sourceCode);
        formatSourceCode(uri);

        const currentDoc = window.activeTextEditor;

        window.showTextDocument(doc, {
          preview: true,
          viewColumn:
            currentDoc === void 0
              ? ViewColumn.Active
              : isNewDoc
                ? ViewColumn.Beside
                : ViewColumn.Active,
        });
      },
    ),
  );

  context.subscriptions.push(
    commands.registerCommand('eolinkApikitExplorer.setup', setup),
  );

  registerSearchCommand(treeView, context);

  context.subscriptions.push(
    commands.registerCommand('eolinkApikitExplorer.refresh', () => {
      tree.refresh();
    }),
  );

  context.subscriptions.push(
    commands.registerCommand('eolinkApikitExplorer.copy', copy),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
