import { mapValues, transformValues } from './objTransforms';
import { PositionedNode, PositionedPlot, PositionedTree, PositionInTree, Sentence, UnpositionedNode, UnpositionedPlot, UnpositionedTree } from './types';

const DEFAULT_TERMINAL_NODE_Y = -2;
const DEFAULT_TRIANGLE_NODE_Y = -20;
const DEFAULT_NODE_LEVEL_DIFF = -40;

type StrWidthFunc = (str: string) => number;

const determineNodePosition =
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedNode): { position: PositionInTree, triangle: { treeX1: number, treeX2: number } | undefined } => {
    if ('slice' in node) {
      // This is a terminal node
      const [sliceStart, sliceEnd] = node.slice;
      const widthBeforeSlice = strWidthFunc(sentence.slice(0, sliceStart));
      const sliceWidth = strWidthFunc(sentence.slice(sliceStart, sliceEnd));
      return {
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

    if ('children' in node) {
      // This is a branching node
      const childNodePositions = transformValues(node.children, determineNodePosition(strWidthFunc)(sentence));
      const childXs = mapValues(childNodePositions, node => node.position.treeX);
      const childYs = mapValues(childNodePositions, node => node.position.treeY);
      return {
        position: {
          treeX: childXs.reduce((accum, cur) => accum + cur, 0) / childXs.length + node.offset.dTreeX,
          treeY: Math.min(...childYs) + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
        },
        triangle: undefined,
      };
    }

    // This is a stranded node
    return {
      position: {
        treeX: node.offset.dTreeX,
        treeY: node.offset.dTreeY,
      },
      triangle: undefined,
    };
  };

/**
 * Returns a node and its descendants, if any, with positions.
 */
const applyNodePosition = (strWidthFunc: StrWidthFunc) => (sentence: Sentence) => (node: UnpositionedNode | PositionedNode): PositionedNode => {
  if ('position' in node) {
    // This node already has a position
    return node;
  }

  if ('children' in node) {
    // This is a branching node - calculate child positions as well
    const positionedChildNodes = transformValues(node.children, applyNodePosition(strWidthFunc)(sentence));
    return {
      ...node,
      children: positionedChildNodes,
      ...determineNodePosition(strWidthFunc)(sentence)(node),
    };
  }

  // This is a terminal node or a stranded node
  return {
    ...node,
    ...determineNodePosition(strWidthFunc)(sentence)(node),
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
