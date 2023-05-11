import { Id, TreeAndNodeId } from '../types';
import { flatten, mapEntries } from '../../util/objTransforms';
import { getParentNodeIdsInTree } from './manipulation';
import { UnpositionedPlot } from './types';

/**
 * Returns the given list of tree and node IDs as a mapping from tree ID to node IDs.
 */
const groupNodeIdsByTree = (treeAndNodeIds: TreeAndNodeId[]): Record<Id, Id[]> =>
  treeAndNodeIds.reduce((groupingById, treeAndNodeId) => ({
    ...groupingById,
    [treeAndNodeId.treeId]: [...(groupingById[treeAndNodeId.treeId] || []), treeAndNodeId.nodeId],
  }), {} as Record<Id, Id[]>);

/**
 * Returns a list of tree and node IDs referring to the parents of the given nodes.
 */
export const getParentNodeIdsInPlot =
  (treeAndNodeIds: TreeAndNodeId[]) =>
  (plot: UnpositionedPlot): TreeAndNodeId[] =>
    flatten(mapEntries(
      groupNodeIdsByTree(treeAndNodeIds),
      ([treeId, nodeIds]) => getParentNodeIdsInTree(nodeIds)(plot.trees[treeId]).map(nodeId => ({ treeId, nodeId })),
    ));

/**
 * Returns whether all given nodes are top-level nodes.
 */
export const allTopLevelInPlot =
  (treeAndNodeIds: TreeAndNodeId[]) =>
  (plot: UnpositionedPlot): boolean =>
    getParentNodeIdsInPlot(treeAndNodeIds)(plot).length === 0;
