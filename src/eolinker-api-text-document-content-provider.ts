import {
  Event,
  ProviderResult,
  TextDocumentContentProvider,
  Uri,
} from 'vscode';

export class EolinkerApiTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  static schema = 'eolinker-api';

  onDidChange?: Event<Uri> | undefined;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    return uri.path;
  }
}
