import { associateWith, filterEntries, isEmpty, mapValues } from '../../util/objTransforms';
import { Id, IdMap, StringSlice } from '../types';
import slicesOverlap from '../slicesOverlap';
import { PositionedNode, PositionedTree } from './types';

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
 * Returns whether the node with the given ID is a top-level node in the given node ID map.
 */
export const isTopLevel = (nodes: IdMap<PositionedNode>) => (nodeId: Id) =>
  isEmpty(filterEntries(nodes, ([_, node]) => 'children' in node && node.children.includes(nodeId)));

/**
 * Returns an ID map consisting of the top-level nodes in the given tree.
 */
export const getTopLevelPositionedNodes = (tree: PositionedTree): IdMap<PositionedNode> =>
  filterEntries(tree.nodes, ([nodeId, _]) => isTopLevel(tree.nodes)(nodeId));

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
