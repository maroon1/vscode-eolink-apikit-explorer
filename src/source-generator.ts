import {
  commands,
  Position,
  Range,
  TextDocument,
  TextEdit,
  Uri,
  window,
  workspace,
  WorkspaceEdit,
} from 'vscode';
import {
  ApiDataType,
  ApiInfo,
  ApiParamInfo,
  apiStatusNameMap,
  BooleanNumber,
} from './api-types';

export function generateCode(api: ApiInfo): Promise<string> | string {
  const meta = `const 名称 = "${api.base_info.api_name}"
    const 状态 = "${apiStatusNameMap.get(api.base_info.api_status) ?? '未知'}";
    const 创建人 = "${api.create_username}";
    const Protocol = "${api.base_info.api_protocol.toUpperCase()}";
    const URL = "${api.base_info.api_request_type.toUpperCase()} ${api.base_info.api_url}";
  `;

  const queryParam = api.url_param?.length
    ? `export interface Query {
    ${generateParamsDto(api.url_param)}
  }`
    : void 0;

  const restfulParam = api.restful_param?.length
    ? `export interface PathParams {
    ${generateParamsDto(api.restful_param)}
  }`
    : void 0;

  const requestBody = api.request_info?.length
    ? `export interface RequestBody {
    ${generateParamsDto(api.request_info)}
  }`
    : void 0;

  const responseBody = api.result_info.map((item) => {
    return item.param_list?.length
      ? `export interface Response${item.is_default === BooleanNumber.是 ? '' : item.response_code}Body {
      ${generateParamsDto(item.param_list)}
    }`
      : void 0;
  });

  return [meta, queryParam, restfulParam, requestBody, ...responseBody]
    .filter(Boolean)
    .join('\n\n');
}

function generateParamsDto(params: ApiParamInfo[] | undefined): string {
  if (params === void 0) {
    return '';
  }

  return params
    .map((item) => {
      let type = tsTypeMap.get(item.param_type);

      if (item.param_type === ApiDataType.object) {
        type = item.child_list?.length
          ? `{
            ${generateParamsDto(item.child_list)}
          }`
          : 'unknown';
      }

      if (item.param_type === ApiDataType.array) {
        type = item.child_list?.length
          ? `{
            ${generateParamsDto(item.child_list)}
          }[]`
          : 'unknown[]';
      }

      return `/**
         * ${item.param_name}
         */
        "${item.param_key}"${item.param_not_null === BooleanNumber.否 ? '?' : ''}: ${type ?? 'unknown'};`;
    })
    .join('\n');
}

const tsTypeMap = new Map([
  [ApiDataType.string, 'string'],
  [ApiDataType.file, 'File'],
  [ApiDataType.json, 'string'],
  [ApiDataType.int, 'number'],
  [ApiDataType.float, 'number'],
  [ApiDataType.double, 'number'],
  [ApiDataType.date, 'string'],
  [ApiDataType.datetime, 'string'],
  [ApiDataType.byte, 'number'],
  [ApiDataType.boolean, 'boolean'],
  [ApiDataType.short, 'number'],
  [ApiDataType.long, 'number'],
  [ApiDataType.number, 'number'],
  [ApiDataType.null, 'null'],
  [ApiDataType.char, 'string'],
]);

export async function insertSourceCode(
  uri: Uri,
  doc: TextDocument,
  sourceCode: string,
) {
  const edit = new WorkspaceEdit();

  edit.replace(
    uri,
    new Range(new Position(0, 0), new Position(doc.lineCount + 1, 0)),
    sourceCode,
  );

  const isApplied = await workspace.applyEdit(edit);

  if (!isApplied) {
    window.showInformationMessage('出错了，无法生成代码');
    return;
  }
}

export async function formatSourceCode(uri: Uri) {
  const edits = await commands.executeCommand<TextEdit[]>(
    'vscode.executeFormatDocumentProvider',
    uri,
  );

  const edit = new WorkspaceEdit();
  edit.set(uri, edits);

  const isApplied = await workspace.applyEdit(edit);

  if (!isApplied) {
    window.showInformationMessage('出错了，无法格式化代码');
    return;
  }
}
