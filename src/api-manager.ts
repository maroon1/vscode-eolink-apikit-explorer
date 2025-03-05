import axios from 'axios';
import { workspace } from 'vscode';
import {
  ApiGroupItem,
  ApiGroupTreeResponse,
  ApiInfoResponse,
  ApiListItem,
  ApiListResponse,
  ApiProjectResponse,
  ApiWorkspaceResponse,
  BaseApiResponse,
} from './api-types';
import { getConfiguration } from './configuration';

class ApiManager {
  #cacheGroupTree: ApiGroupItem[] | undefined;

  #cacheApiList: ApiListItem[] | undefined;

  workspaceId?: string;

  projectId?: string;

  constructor() {
    this.#setRequestParams();

    workspace.onDidChangeConfiguration((e) => {
      if (!e.affectsConfiguration('eolinkApikitExplorer.settings')) {
        return;
      }

      this.#setRequestParams();
      this.#clearCache();
    });
  }

  async getWorkspaces() {
    const { data } = await axios.postForm<ApiWorkspaceResponse>(
      'v2/workspace/workspace/search',
    );

    throwError(data);

    return data.result;
  }

  async getProjects(spaceId: string) {
    const { data } = await axios.postForm<ApiProjectResponse>(
      'v2/api_studio/management/project/search',
      {
        space_id: spaceId,
      },
    );

    throwError(data);

    return data.result;
  }

  async getApiGroupMap() {
    if (this.#cacheGroupTree) {
      return this.#cacheGroupTree;
    }

    const { data } = await axios.postForm<ApiGroupTreeResponse>(
      'v2/api_studio/management/api/get_group_list',
      {
        space_id: this.workspaceId,
        project_id: this.projectId,
      },
    );

    throwError(data);

    this.#cacheGroupTree = data.group_list;

    return this.#cacheGroupTree;
  }

  async getApiList() {
    if (this.#cacheApiList) {
      return this.#cacheApiList;
    }

    const { data } = await axios.postForm<ApiListResponse>(
      'v2/api_studio/management/api/search',
      {
        space_id: this.workspaceId,
        project_id: this.projectId,
      },
    );

    throwError(data);

    this.#cacheApiList = data.result;

    return this.#cacheApiList;
  }

  async getApiInfo(apiId: number) {
    const { data } = await axios.postForm<ApiInfoResponse>(
      '/v2/api_studio/management/api/api_info',
      {
        space_id: this?.workspaceId,
        project_id: this?.projectId,
        api_id: apiId,
      },
    );

    throwError(data);

    return data;
  }

  #setRequestParams() {
    const settings = getConfiguration();

    this.workspaceId = settings?.workspaceId;
    this.projectId = settings?.projectId;
    axios.defaults.baseURL = settings?.origin;
    axios.defaults.headers.common['Eo-Secret-Key'] = settings?.apiKey;
  }

  #clearCache() {
    this.#cacheApiList = void 0;
    this.#cacheGroupTree = void 0;
  }
}

export const apiManager = new ApiManager();

function throwError(res: BaseApiResponse) {
  if (res.status === 'success') {
    return;
  }

  throw new Error(res.error_info);
}
