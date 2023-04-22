import { filterEntries } from '../core/objTransforms';
import { Id, IdMap, PlotCoords, PlotRect, PositionedNode, PositionedTree } from '../core/types';

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
 * Returns the position of the given node in the given tree with respect to its containing plot.
 */
export const calculateNodePositionOnPlot = (tree: PositionedTree) => (node: PositionedNode): PlotCoords => ({
  plotX: tree.position.plotX + node.position.treeX,
  plotY: tree.position.plotY + node.position.treeY
});

/**
 * Returns whether the given point is inside the given rectangle.
 */
const isPointInPlotRect = (rect: PlotRect) => (coords: PlotCoords) =>
  coords.plotX >= rect.topLeft.plotX && coords.plotY >= rect.topLeft.plotY &&
  coords.plotX <= rect.bottomRight.plotX && coords.plotY <= rect.bottomRight.plotY;

export const isNodeInRect = (rect: PlotRect) => (tree: PositionedTree) => (node: PositionedNode) =>
  isPointInPlotRect(rect)(calculateNodePositionOnPlot(tree)(node))
