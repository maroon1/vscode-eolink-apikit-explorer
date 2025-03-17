import {
  Event,
  ProviderResult,
  TextDocumentContentProvider,
  Uri,
} from 'vscode';

export class ApikitTextDocumentContentProvider
  implements TextDocumentContentProvider
{
  static schema = 'eolink-apikit-api-info';

  onDidChange?: Event<Uri> | undefined;

  provideTextDocumentContent(uri: Uri): ProviderResult<string> {
    return uri.path;
  }
}
