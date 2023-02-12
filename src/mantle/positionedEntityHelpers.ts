import { filterEntries, isEmpty } from '../core/objTransforms';
import { IdMap, PlotCoords, PlotRect, PositionedNode, PositionedTree } from '../core/types';

const childrenOrEmpty = (node: PositionedNode) => 'children' in node ? node.children : {};

const filterPositionedNodesRecursively =
  (predicate: (node: PositionedNode) => boolean) =>
  (nodes: IdMap<PositionedNode>): IdMap<PositionedNode> =>
    isEmpty(nodes)
      ? nodes
      : {
        ...filterEntries(nodes, ([_, node]) => predicate(node)),
        ...filterPositionedNodesRecursively(predicate)(Object.values(nodes).reduce((accum, node) => ({
          ...accum,
          ...childrenOrEmpty(node),
        }), {})),
      };

/**
 * Returns the node with the given ID in the given tree, or undefined if no node with this ID is found.
 */
export const filterPositionedNodesInTree =
  (predicate: (node: PositionedNode) => boolean) =>
  (tree: PositionedTree): IdMap<PositionedNode> =>
    filterPositionedNodesRecursively(predicate)(tree.nodes);

/**
 * Returns the position of the given node in the given tree with respect to its containing plot.
 */
const calculateNodePositionOnPlot = (tree: PositionedTree) => (node: PositionedNode): PlotCoords => ({
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
