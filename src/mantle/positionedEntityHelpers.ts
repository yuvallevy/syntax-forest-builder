import { filterEntries } from '../core/objTransforms';
import { Id, IdMap, PositionedNode, PositionedTree } from '../core/types';

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
