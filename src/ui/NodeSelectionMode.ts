import { union } from '../core/objTransforms';
import { TreeAndNodeId } from '../core/types';

export type NodeSelectionMode = 'SET' | 'ADD';

export const applySelection = (mode: NodeSelectionMode, newIds: TreeAndNodeId[], existingIds?: TreeAndNodeId[]) =>
  mode === 'ADD' ? union(existingIds || [], newIds)
    : newIds;
