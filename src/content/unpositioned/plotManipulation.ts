import { Id, NodeIndicatorInPlot } from '../types';
import { flatten, mapEntries } from '../../util/objTransforms';
import { getParentNodeIdsInTree } from './manipulation';
import { UnpositionedPlot } from './types';

/**
 * Returns the given list of tree and node IDs as a mapping from tree ID to node IDs.
 */
const groupNodeIdsByTree = (nodeIndicators: NodeIndicatorInPlot[]): Record<Id, Id[]> =>
  nodeIndicators.reduce((groupingById, nodeIndicator) => ({
    ...groupingById,
    [nodeIndicator.treeId]: [...(groupingById[nodeIndicator.treeId] || []), nodeIndicator.nodeId],
  }), {} as Record<Id, Id[]>);

/**
 * Returns a list of tree and node IDs referring to the parents of the given nodes.
 */
export const getParentNodeIdsInPlot =
  (nodeIndicators: NodeIndicatorInPlot[]) =>
  (plot: UnpositionedPlot): NodeIndicatorInPlot[] =>
    flatten(mapEntries(
      groupNodeIdsByTree(nodeIndicators),
      ([treeId, nodeIds]) => getParentNodeIdsInTree(nodeIds)(plot.trees[treeId]).map(nodeId => ({ treeId, nodeId })),
    ));

/**
 * Returns whether all given nodes are top-level nodes.
 */
export const allTopLevelInPlot =
  (nodeIndicators: NodeIndicatorInPlot[]) =>
  (plot: UnpositionedPlot): boolean =>
    getParentNodeIdsInPlot(nodeIndicators)(plot).length === 0;
