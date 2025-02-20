import { ApiListItem } from './api-types';

export interface BaseTreeNode {
  id: number;

  name: string;

  type: 'group' | 'api';
}

export interface ApiGroupTreeNode extends BaseTreeNode {
  type: 'group';

  parent_group_id: number;

  group_id: number;

  group_name: string;

  is_leaf: boolean;

  level: number;
}

export interface ApiTreeNode extends BaseTreeNode, ApiListItem {
  type: 'api';
}

export type TreeNode = ApiGroupTreeNode | ApiTreeNode;

export interface ApiSettings {
  origin?: string;

  apiKey?: string;

  workspaceId?: string;

  projectId?: string;
}
