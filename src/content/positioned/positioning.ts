import { associateWith, filterEntries, isEmpty, mapValues, transformValues } from '../../util/objTransforms';
import {
  Id, IdMap, Sentence,
  StringSlice,
} from '../types';
import { PositionedNode, PositionedPlot, PositionedTree, PositionInTree } from './types';
import {
  isBranching, isFormerlyBranching, isFormerlyTerminal, isTerminal, UnpositionedBranchingNode, UnpositionedNode,
  UnpositionedPlot, UnpositionedStrandedNode, UnpositionedTerminalNode, UnpositionedTree
} from '../unpositioned/types';

const DEFAULT_TERMINAL_NODE_Y = -2;
const DEFAULT_TRIANGLE_NODE_Y = -20;
const DEFAULT_NODE_LEVEL_DIFF = -40;

export type StrWidthFunc = (str: string) => number;

const average = (values: number[]) => values.reduce((accum, cur) => accum + cur, 0) / values.length;

export const sliceOffsetAndWidth = (strWidthFunc: StrWidthFunc) => (sentence: Sentence) => (slice: StringSlice) => {
  const [sliceStart, sliceEnd] = slice;
  const widthBeforeSlice = strWidthFunc(sentence.slice(0, sliceStart));
  const sliceWidth = strWidthFunc(sentence.slice(sliceStart, sliceEnd));
  return [widthBeforeSlice, sliceWidth];
};

export const determineNaturalParentNodePosition = (childNodePositions: PositionInTree[]): PositionInTree => ({
  // Branching nodes are positioned as follows:
  // X - average of all X positions of its direct descendants (regardless of any descendants further down the tree)
  // Y - a certain distance above the topmost child node
  treeX: average(childNodePositions.map(({ treeX }) => treeX)),
  treeY: Math.min(...childNodePositions.map(({ treeY }) => treeY)) + DEFAULT_NODE_LEVEL_DIFF,
});

const determineBranchingNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (node: UnpositionedBranchingNode): { position: PositionInTree, triangle: undefined } => {
    const positionedChildNodes = filterEntries(alreadyPositionedNodes, ([nodeId, _]) => node.children.includes(nodeId));
    const naturalPosition = determineNaturalParentNodePosition(mapValues(positionedChildNodes, node => node.position));
    return {
      position: {
        treeX: naturalPosition.treeX + node.offset.dTreeX,
        treeY: naturalPosition.treeY + node.offset.dTreeY,
      },
      triangle: undefined,
    };
  };

const determineTerminalNodePosition =
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedTerminalNode): { position: PositionInTree, triangle: { treeX1: number, treeX2: number } | undefined } => {
    // Terminal nodes are positioned as follows:
    // X - exact center of the assigned slice, as measured in pixels
    // Y - a little above the slice if it is not a triangle node; a larger distance above the slice if it is
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
    if (isFormerlyTerminal(node)) {  // Node was terminal - determine its position based on its slice
      const [widthBeforeSlice, sliceWidth] = sliceOffsetAndWidth(strWidthFunc)(sentence)(node.formerSlice);
      position = {
        treeX: widthBeforeSlice + (sliceWidth / 2) + node.offset.dTreeX,
        treeY: (node.formerlyTriangle ? DEFAULT_TRIANGLE_NODE_Y : DEFAULT_TERMINAL_NODE_Y) + node.offset.dTreeY,
      };
    } else if (isFormerlyBranching(node)) {  // Node was branching - determine its position based on past children
      const positionedChildNodes = applyNodePositions(node.formerDescendants, sentence, strWidthFunc);
      const childXs = mapValues(positionedChildNodes, node => node.position.treeX);
      const childYs = mapValues(positionedChildNodes, node => node.position.treeY);
      position = {
        treeX: average(childXs) + node.offset.dTreeX,
        treeY: Math.min(...childYs) + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
      };
    } else {  // Node was never anything other than stranded - just use its X and Y offset
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

/**
 * Returns the appropriate position for the given unpositioned node.
 */
const determineNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedNode): { position: PositionInTree, triangle: { treeX1: number, treeX2: number } | undefined } =>
    isBranching(node) ? determineBranchingNodePosition(alreadyPositionedNodes)(node)
      : isTerminal(node) ? determineTerminalNodePosition(strWidthFunc)(sentence)(node)
      : determineStrandedNodePosition(strWidthFunc)(sentence)(node);

/**
 * Returns a positioned node corresponding to the given unpositioned node, based on already assigned node positions,
 * width calculation function and sentence associated with the tree.
 */
const applyNodePosition =
  (alreadyPositionedNodes: IdMap<PositionedNode>) =>
  (strWidthFunc: StrWidthFunc) =>
  (sentence: Sentence) =>
  (node: UnpositionedNode): PositionedNode => ({
    ...node,
    ...determineNodePosition(alreadyPositionedNodes)(strWidthFunc)(sentence)(node),
  });

/**
 * Receives an ID map of unpositioned nodes and returns an equivalent map of nodes with assigned positions.
 * This function is recursive and progressively assigns positions to more and more nodes until the whole tree is filled.
 */
const applyNodePositions = (
  nodes: IdMap<UnpositionedNode>,
  sentence: Sentence,
  strWidthFunc: StrWidthFunc,
  alreadyPositionedNodes: IdMap<PositionedNode> = {},
): IdMap<PositionedNode> => {
  // If no unpositioned nodes are left, we're done
  if (isEmpty(nodes)) return alreadyPositionedNodes;

  // Nodes that can be positioned at this point in the process are:
  // * Terminal nodes, whose position is entirely based on their assigned slice
  // * Stranded nodes, which internally store the descendants or slice that they once had
  // * Branching nodes whose children all have known positions
  const nodesToPositionNow = filterEntries(nodes, ([_, node]) =>
    !isBranching(node) || node.children.every(childId => alreadyPositionedNodes.hasOwnProperty(childId)));

  // Assign positions to all the nodes we've determined to be ready for positioning
  const newPositionedNodes = transformValues(nodesToPositionNow,
    applyNodePosition(alreadyPositionedNodes)(strWidthFunc)(sentence));

  // All other nodes will be positioned in one of the next iterations
  const nodesToPositionNext = filterEntries(nodes, ([nodeId, _]) => !nodesToPositionNow.hasOwnProperty(nodeId));

  // Repeat the process, using as unpositioned nodes only those nodes that are have not been assigned positions yet
  return applyNodePositions(nodesToPositionNext, sentence, strWidthFunc,
    { ...alreadyPositionedNodes, ...newPositionedNodes });
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

/**
 * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
 */
export const sortNodesByXCoord = (strWidthFunc: StrWidthFunc) => (tree: UnpositionedTree) => (nodeIds: Id[]): Id[] => {
  const positionedTree = applyNodePositionsToTree(strWidthFunc)(tree);
  return Object.entries(associateWith(nodeIds, nodeId => positionedTree.nodes[nodeId].position.treeX))
    .sort(([_, treeX1], [__, treeX2]) => treeX1 - treeX2)
    .map(([nodeId, _]) => nodeId);
};
