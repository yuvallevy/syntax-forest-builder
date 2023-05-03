import { filterEntries, isEmpty, mapValues, transformValues } from './objTransforms';
import {
  IdMap, isBranching, isTerminal, PositionedNode, PositionedPlot, PositionedTree, PositionInTree, Sentence, StringSlice,
  UnpositionedBranchingNode, UnpositionedNode, UnpositionedPlot, UnpositionedStrandedNode, UnpositionedTerminalNode,
  UnpositionedTree,
} from './types';

const DEFAULT_TERMINAL_NODE_Y = -2;
const DEFAULT_TRIANGLE_NODE_Y = -20;
const DEFAULT_NODE_LEVEL_DIFF = -40;

type StrWidthFunc = (str: string) => number;

const average = (values: number[]) => values.reduce((accum, cur) => accum + cur, 0) / values.length;

const sliceOffsetAndWidth = (strWidthFunc: StrWidthFunc) => (sentence: Sentence) => (slice: StringSlice) => {
  const [sliceStart, sliceEnd] = slice;
  const widthBeforeSlice = strWidthFunc(sentence.slice(0, sliceStart));
  const sliceWidth = strWidthFunc(sentence.slice(sliceStart, sliceEnd));
  return [widthBeforeSlice, sliceWidth];
};

const determineBranchingNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (node: UnpositionedBranchingNode): { position: PositionInTree, triangle: undefined } => {
    const positionedChildNodes = filterEntries(alreadyPositionedNodes, ([nodeId, _]) => node.children.includes(nodeId));
    const childXs = mapValues(positionedChildNodes, node => node.position.treeX);
    const childYs = mapValues(positionedChildNodes, node => node.position.treeY);
    return {
      position: {
        treeX: average(childXs) + node.offset.dTreeX,
        treeY: Math.min(...childYs) + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
      },
      triangle: undefined,
    };
  };

const determineTerminalNodePosition =
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedTerminalNode): { position: PositionInTree, triangle: { treeX1: number, treeX2: number } | undefined } => {
    const [widthBeforeSlice, sliceWidth] = sliceOffsetAndWidth(strWidthFunc)(sentence)(node.slice);
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
  };

const determineStrandedNodePosition =
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedStrandedNode): { position: PositionInTree, triangle: undefined } => {
    let position: PositionInTree;
    if (node.formerSlice) {
      const [widthBeforeSlice, sliceWidth] = sliceOffsetAndWidth(strWidthFunc)(sentence)(node.formerSlice);
      position = {
        treeX: widthBeforeSlice + (sliceWidth / 2) + node.offset.dTreeX,
        treeY: (node.formerlyTriangle ? DEFAULT_TRIANGLE_NODE_Y : DEFAULT_TERMINAL_NODE_Y) + node.offset.dTreeY,
      };
    } else if (node.formerDescendants) {
      const positionedChildNodes = applyNodePositions(node.formerDescendants, sentence, strWidthFunc);
      const childXs = mapValues(positionedChildNodes, node => node.position.treeX);
      const childYs = mapValues(positionedChildNodes, node => node.position.treeY);
      position = {
        treeX: average(childXs) + node.offset.dTreeX,
        treeY: Math.min(...childYs) + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
      };
    } else {
      position = {
        treeX: node.offset.dTreeX,
        treeY: node.offset.dTreeY,
      };
    }
    return {
      position,
      triangle: undefined,
    };
  };

export const determineNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedNode): { position: PositionInTree, triangle: { treeX1: number, treeX2: number } | undefined } =>
    isBranching(node) ? determineBranchingNodePosition(alreadyPositionedNodes)(node)
      : isTerminal(node) ? determineTerminalNodePosition(strWidthFunc)(sentence)(node)
      : determineStrandedNodePosition(strWidthFunc)(sentence)(node);

const applyNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedNode): PositionedNode => ({
    ...node,
    ...determineNodePosition(alreadyPositionedNodes)(strWidthFunc)(sentence)(node),
  });

const applyNodePositions = (
  nodes: IdMap<UnpositionedNode>,
  sentence: Sentence,
  strWidthFunc: StrWidthFunc,
  alreadyPositionedNodes: IdMap<PositionedNode> = {},
): IdMap<PositionedNode> => {
  if (isEmpty(nodes)) return alreadyPositionedNodes;

  const nodesToPositionNow = filterEntries(nodes, ([_, node]) =>
    !isBranching(node) || node.children.every(childId => alreadyPositionedNodes.hasOwnProperty(childId)));
  const nodesToPositionNext = filterEntries(nodes, ([nodeId, _]) => !nodesToPositionNow.hasOwnProperty(nodeId));
  const newPositionedNodes = transformValues(nodesToPositionNow, applyNodePosition(alreadyPositionedNodes)(strWidthFunc)(sentence));
  return applyNodePositions(nodesToPositionNext, sentence, strWidthFunc, { ...alreadyPositionedNodes, ...newPositionedNodes });
};

/**
 * Returns a copy of the given tree with positions for all nodes.
 */
export const applyNodePositionsToTree = (strWidthFunc: StrWidthFunc) => (tree: UnpositionedTree): PositionedTree => ({
  ...tree,
  nodes: applyNodePositions(tree.nodes, tree.sentence, strWidthFunc),
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
