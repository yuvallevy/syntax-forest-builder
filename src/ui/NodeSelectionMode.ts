import { union } from '../core/objTransforms';
import { TreeAndNodeId } from './state';

export type NodeSelectionMode = 'SET' | 'ADD';

export const applySelection = (mode: NodeSelectionMode, newIds: TreeAndNodeId[], existingIds?: TreeAndNodeId[]) =>
  mode === 'ADD' ? union(existingIds || [], newIds)
    : newIds;
