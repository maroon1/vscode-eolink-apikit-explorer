export type BaseApiResponse = {
  type?: string;
  /**
   * 接口状态
   */
  status: string;
  /**
   * 错误信息
   */
  error_info?: string;
};

export interface ApiWorkspaceResponse extends BaseApiResponse {
  type: 'workspace';

  result: ApiWorkspaceListItem[];
}

export interface ApiWorkspaceListItem {
  /**
   * 空间名称
   */
  space_name: string;
  /**
   * 空间ID
   */
  space_id: string;
  /**
   * 空间简介
   */
  space_introduce: string;
}

export interface ApiProjectResponse extends BaseApiResponse {
  type: 'project';

  result: ApiProjectListItem[];
}

export interface ApiProjectListItem {
  /**
   * 项目名称
   */
  project_name: string;
  /**
   * 项目ID
   */
  project_id: string;
  /**
   * 是否归档
   */
  is_archive: BooleanNumber;
  /**
   * 创建人名称
   */
  creator: string;
  /**
   * 创建人账号
   */
  create_username: string;
}

export interface ApiGroupTreeResponse extends BaseApiResponse {
  group_list: ApiGroupItem[];
}

export interface ApiGroupItem {
  /**
   * 分组 ID
   *
   * 根结点 ID 为 0
   */
  group_id: number;
  /**
   * 分组名称
   */
  group_name: string;
  /**
   * 分组父级ID
   */
  parent_group_id: number;
  /**
   * 子级列表
   *
   * 叶子节点为 `undefined`
   */
  group_child_list?: ApiGroupItem[];
}

export interface ApiListResponse extends BaseApiResponse {
  result: ApiListItem[];
}

export interface ApiListItem {
  /**
   * API ID
   */
  api_id: number;
  /**
   * API名称
   */
  api_name: string;
  /**
   * API地址
   */
  api_path: string;
  /**
   * 标签
   */
  api_tags: string;
  /**
   * 接口状态
   */
  api_status: string;
  /**
   * 请求协议
   */
  protocal: string;
  /**
   * 请求方法
   */
  method: ApiRequestMethod;
  /**
   * 创建人
   */
  creator: string;
  /**
   * 最后编辑人
   */
  updater: string;
  /**
   * 最后更新时间
   */
  update_time: string;
  /**
   * 分组 ID
   */
  group_id: number;
  /**
   * 分组名称
   */
  group_name: string;
}

export interface ApiInfoResponse extends BaseApiResponse {
  type: 'api';

  api_info: ApiInfo;
}

export interface ApiInfo {
  /**
   * 基础信息
   */
  base_info: ApiBaseInfo;
  /**
   * 请求头部信息
   */
  header_info: ApiHeaderInfo[];
  /**
   * query参数
   */
  url_param?: ApiParamInfo[];
  /**
   * rest参数
   */
  restful_param?: ApiParamInfo[];
  /**
   * 请求内容
   */
  request_info?: ApiParamInfo[];
  /**
   * 返回头
   */
  response_header: ApiHeaderInfo[];
  /**
   * raw请求体内容
   */
  api_request_raw: string;
  /**
   * 返回内容
   */
  result_info: ApiResultInfo[];

  customize_list: {
    /**
     * 自定义属性别名, x-开头
     */
    cust_attr_another_name: string;
    /**
     * 自定义属性名
     */
    name: string;
    /**
     * - 0:文本
     * - 1:数字
     * - 2:日期
     * - 3:单选
     * - 4:多选
     * - 5:项目成员（存id）
     */
    type: string;
    /**
     * 自定义属性的值
     *
     * - 字符串
     * - 整型
     * - 日期(yyyy-MM-dd HH:mm:ss)
     * - 单选(key)
     * - 多选(key1,key2,key3)
     * - 项目成员(2837373)
     */
    value: string;
  }[];
  /**
   * API 类型
   */
  api_type: 'http';
  /**
   * 创建人
   */
  create_username: string;
}

export const enum ApiRequestMethod {
  POST = 'post',
  GET = 'get',
  PUT = 'put',
  DELETE = 'delete',
  HEAD = 'head',
  OPTIONS = 'options',
  PATCH = 'patch',
}

type ApiStarred = 'starred' | 'remove_star';

export const enum ApiRequestParamType {
  FormData = 'form-data',
  JSON = 'json',
  XML = 'xml',
  Raw = 'raw',
  Binary = 'binary',
}

export const enum ApiProtocol {
  HTTP = 'http',
  HTTPS = 'https',
}

interface ApiBaseInfo {
  /**
   * 接口名称
   */
  api_name: string;
  /**
   * 接口URL
   */
  api_url: string;
  /**
   * 接口协议
   */
  api_protocol: ApiProtocol;
  /**
   * 成功mock
   */
  api_success_mock: string;
  /**
   * 失败mock
   */
  api_failure_mock: string;
  /**
   * 请求方式
   */
  api_request_type: ApiRequestMethod;
  /**
   * 接口状态
   */
  api_status: ApiStatus;
  /**
   * 星标
   */
  starred: ApiStarred;
  /**
   * 接口请求参数类型
   */
  api_request_param_type: ApiRequestParamType;
  /**
   * 接口失败状态码
   */
  api_failure_status_code: string;
  /**
   * 接口成功状态码
   */
  api_success_status_code: string;
  /**
   * 接口失败内容
   */
  api_failure_content_type: string;
  /**
   * 接口成功内容
   */
  api_success_content_type: string;
  /**
   * json根类型
   */
  api_request_param_json_type: ApiJsonType;
  /**
   * 接口标签
   */
  api_tag: string;
  /**
   * 接口ID
   */
  api_id: number;
  /**
   * 分组ID
   */
  group_id: number;
  /**
   * 创建时间
   */
  create_time: string;
  /**
   * 更新时间
   */
  api_update_time: string;
}

interface ApiHeaderInfo {
  /**
   * 标签
   */
  header_name: string;
  /**
   * 默认值
   */
  header_value: string;
  /**
   * 说明
   */
  param_name: string;
  /**
   * 是否空
   */
  param_not_null: BooleanNumber;
  /**
   * 类型
   */
  param_type: ApiDataType.string;
}

/**
 * 参数信息
 */
export interface ApiParamInfo {
  /**
   * 是否必填
   */
  param_not_null: BooleanNumber;
  /**
   * 参数类型
   */
  param_type: ApiDataType;
  /**
   * 参数说明
   */
  param_name: string;
  /**
   * 参数名
   */
  param_key: string;
  /**
   * 参数示例
   */
  param_value: string;
  /**
   * 参数限制
   */
  param_limit: number;
  /**
   * 备注
   */
  param_note: string;
  /**
   * 参数值可能性
   */
  param_value_list: {
    /**
     * 参数类型
     */
    param_type: ApiDataType;
    /**
     * 值
     */
    value: string;
    /**
     * 描述
     */
    value_description: string;
  }[];
  /**
   * 描述
   */
  default: string;
  /**
   * 子列表和父级得参数是一样的
   */
  child_list?: ApiParamInfo[];
  /**
   * 最小长度
   */
  min_length: number;
  /**
   * 最大长度
   */
  max_length: number;
  /**
   * 最小值
   */
  min_value: number;
  /**
   * 最大值
   */
  max_value: number;
}

interface ApiResultInfo {
  /**
   * 返回体ID
   */
  response_id: number;
  /**
   * 返回体ID
   */
  response_code: string;
  /**
   * 返回体名称
   */
  response_name: string;
  /**
   * 返回体类型
   */
  response_type: ApiResponseType;
  /**
   * raw类型-内容
   */
  raw: string;
  /**
   * json-类型
   */
  param_json_type: ApiJsonType;
  /**
   * 是否默认
   */
  is_default: BooleanNumber;
  /**
   * binary类型-内容
   */
  binary: string;
  /**
   * 参数列表
   */
  param_list?: ApiParamInfo[];
}

export const enum BooleanNumber {
  是 = 1,
  否 = 0,
}

export const enum ApiStatus {
  已发布 = 'enable',
  维护 = 'maintain',
  弃用 = 'abort',
  待确定 = 'pending',
  开发 = 'dev',
  测试 = 'test',
  对接 = 'debug',
  异常 = 'bug',
  设计中 = 'planning',
  完成 = 'finish',
}

export const apiStatusNameMap = new Map([
  [ApiStatus.完成, '完成'],
  [ApiStatus.对接, '对接'],
  [ApiStatus.已发布, '已发布'],
  [ApiStatus.开发, '开发'],
  [ApiStatus.异常, '异常'],
  [ApiStatus.弃用, '弃用'],
  [ApiStatus.待确定, '待确定'],
  [ApiStatus.测试, '测试'],
  [ApiStatus.维护, '维护'],
  [ApiStatus.设计中, '设计中'],
]);

export const enum ApiDataType {
  string = '0',
  file = '1',
  json = '2',
  int = '3',
  float = '4',
  double = '5',
  date = '6',
  datetime = '7',
  byte = '9',
  boolean = '8',
  short = '10',
  long = '11',
  array = '12',
  object = '13',
  number = '14',
  null = '15',
  char = 'char',
}

export const enum ApiResponseType {
  JSON = '0',
  XML = '1',
  Binary = '2',
  Raw = '3',
}

export const enum ApiJsonType {
  Object = 'object',
  Array = 'array',
}
