import { parse } from '@babel/parser';

import {
  CancellationToken,
  CodeLens,
  CodeLensProvider,
  Event,
  Position,
  ProviderResult,
  Range,
  TextDocument,
} from 'vscode';

export class ApikitCodeLensProvider implements CodeLensProvider {
  onDidChangeCodeLenses?: Event<void> | undefined;

  provideCodeLenses(
    document: TextDocument,
    _token: CancellationToken,
  ): ProviderResult<CodeLens[]> {
    const codeLenses: CodeLens[] = [];

    const content = document.getText();
    const result = parse(content, {
      sourceType: 'module',
      plugins: ['typescript'],
    });

    for (const statement of result.program.body) {
      if (statement.type !== 'ExportNamedDeclaration') {
        continue;
      }

      const declaration = statement.declaration;

      if (declaration?.type !== 'TSInterfaceDeclaration') {
        continue;
      }

      const start = new Position(
        (declaration.loc?.start.line ?? 0) - 1,
        (declaration.loc?.start.column ?? 0) - 1,
      );
      const end = start.with();
      const range = new Range(start, end);

      const codelens = new CodeLens(range, {
        title: '点我复制',
        arguments: [
          content.slice(declaration.start ?? 0, declaration.end ?? 0),
        ],
        command: 'eolinkApikitExplorer.copy',
      });

      codeLenses.push(codelens);
    }

    return codeLenses;
  }
}
