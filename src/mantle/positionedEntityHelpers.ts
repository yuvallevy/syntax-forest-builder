import { associateWith, filterEntries, isEmpty, mapValues } from '../core/objTransforms';
import { Id, IdMap, PositionedNode, PositionedTree, StringSlice } from '../core/types';
import { slicesOverlap } from './manipulation';

/**
 * Returns nodes matching the given predicate in the given tree.
 */
export const filterPositionedNodesInTree =
  (predicate: (node: PositionedNode) => boolean) =>
  (tree: PositionedTree): IdMap<PositionedNode> =>
    filterEntries(tree.nodes, ([_, node]) => predicate(node));

/**
 * Returns nodes with the given IDs in the given tree.
 */
export const filterPositionedNodesInTreeById =
  (nodeIds: Id[]) =>
  (tree: PositionedTree): IdMap<PositionedNode> =>
    filterEntries(tree.nodes, ([nodeId, _]) => nodeIds.includes(nodeId));

/**
 * Returns an ID map consisting of the top-level nodes in the given tree.
 */
export const getTopLevelPositionedNodes = (tree: PositionedTree): IdMap<PositionedNode> => {
  const isTopLevelInTree = (nodeId: Id) =>
    isEmpty(filterPositionedNodesInTree(node => 'children' in node && node.children.includes(nodeId))(tree));
  return filterEntries(tree.nodes, ([nodeId, _]) => isTopLevelInTree(nodeId));
};

/**
 * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
 */
export const sortPositionedNodesByXCoord = (tree: PositionedTree) => (nodeIds: Id[]) =>
  Object.entries(associateWith(nodeIds, nodeId => tree.nodes[nodeId].position.treeX))
    .sort(([_, treeX1], [__, treeX2]) => treeX1 - treeX2)
    .map(([nodeId, _]) => nodeId);

/**
 * Returns true if there are no nodes assigned to any slices overlapping the given one.
 */
export const isSliceUnassigned = (tree: PositionedTree) => (slice: StringSlice) => {
  const nodesAssignedToSlice = mapValues(tree.nodes, node => 'slice' in node && slicesOverlap(node.slice, slice));
  return nodesAssignedToSlice.every(overlapsSlice => !overlapsSlice);
};
