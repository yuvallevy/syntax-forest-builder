import { filterEntries, isEmpty } from '../core/objTransforms';
import { Id, IdMap, PlotCoords, PlotRect, PositionedNode, PositionedTree } from '../core/types';

const childrenOrEmpty = (node: PositionedNode) => 'children' in node ? node.children : {};

const filterPositionedNodesRecursively =
  (predicate: ([nodeId, node]: [Id, PositionedNode]) => boolean) =>
  (nodes: IdMap<PositionedNode>): IdMap<PositionedNode> =>
    isEmpty(nodes)
      ? nodes
      : {
        ...filterEntries(nodes, predicate),
        ...filterPositionedNodesRecursively(predicate)(Object.values(nodes).reduce((accum, node) => ({
          ...accum,
          ...childrenOrEmpty(node),
        }), {})),
      };

/**
 * Returns nodes matching the given predicate in the given tree.
 */
export const filterPositionedNodesInTree =
  (predicate: (node: PositionedNode) => boolean) =>
  (tree: PositionedTree): IdMap<PositionedNode> =>
    filterPositionedNodesRecursively(([_, node]) => predicate(node))(tree.nodes);

/**
 * Returns nodes with the given IDs in the given tree.
 */
export const filterPositionedNodesInTreeById =
  (nodeIds: Id[]) =>
  (tree: PositionedTree): IdMap<PositionedNode> =>
    filterPositionedNodesRecursively(([nodeId, _]) => nodeIds.includes(nodeId))(tree.nodes);

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
