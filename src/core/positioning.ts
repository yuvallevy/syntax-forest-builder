import { mapValues, transformValues } from './objTransforms';
import { PositionedNode, PositionedPlot, PositionedTree, Sentence, UnpositionedNode, UnpositionedPlot, UnpositionedTree } from './types';

const DEFAULT_TERMINAL_NODE_Y = -2;
const DEFAULT_TRIANGLE_NODE_Y = -20;
const DEFAULT_NODE_LEVEL_DIFF = -40;

type StrWidthFunc = (str: string) => number;

/**
 * Returns a node and its descendants, if any, with positions.
 */
const applyNodePosition = (strWidthFunc: StrWidthFunc) => (sentence: Sentence) => (node: UnpositionedNode | PositionedNode): PositionedNode => {
  if ('position' in node) {
    // This node already has a position
    return node;
  }

  if ('slice' in node) {
    // This is a terminal node
    const [sliceStart, sliceEnd] = node.slice;
    const widthBeforeSlice = strWidthFunc(sentence.slice(0, sliceStart));
    const sliceWidth = strWidthFunc(sentence.slice(sliceStart, sliceEnd));
    return {
      ...node,
      position: {
        treeX: widthBeforeSlice + (sliceWidth / 2) + node.offset.dTreeX,
        treeY: (node.triangle ? DEFAULT_TRIANGLE_NODE_Y : DEFAULT_TERMINAL_NODE_Y) + node.offset.dTreeY,
      },
      triangle: node.triangle ? {
        treeX1: widthBeforeSlice,
        treeX2: widthBeforeSlice + sliceWidth,
      } : undefined,
    };
  }

  // This is a branching node
  const positionedChildNodes = transformValues(node.children, applyNodePosition(strWidthFunc)(sentence));
  const childXs = mapValues(positionedChildNodes, node => node.position.treeX);
  const childYs = mapValues(positionedChildNodes, node => node.position.treeY);
  return {
    ...node,
    children: positionedChildNodes,
    position: {
      treeX: childXs.reduce((accum, cur) => accum + cur, 0) / childXs.length + node.offset.dTreeX,
      treeY: Math.min(...childYs) + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
    },
  };
}

/**
 * Returns a copy of the given tree with positions for all nodes.
 */
export const applyNodePositionsToTree = (strWidthFunc: StrWidthFunc) => (tree: UnpositionedTree): PositionedTree => ({
  ...tree,
  nodes: transformValues(tree.nodes, applyNodePosition(strWidthFunc)(tree.sentence)),
  position: {
    plotX: tree.offset.dPlotX,
    plotY: tree.offset.dPlotY,
  },
  width: strWidthFunc(tree.sentence),
});

/**
 * Returns a copy of the given plot with positions for all trees and nodes.
 */
export const applyNodePositionsToPlot = (strWidthFunc: StrWidthFunc) => (plot: UnpositionedPlot): PositionedPlot => ({
  ...plot,
  trees: transformValues(plot.trees, applyNodePositionsToTree(strWidthFunc)),
});
