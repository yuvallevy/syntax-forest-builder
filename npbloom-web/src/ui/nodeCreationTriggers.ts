import { Id, Sentence, StringSlice } from '../content/types';
import {
  getTopLevelPositionedNodes, isSliceUnassigned, sortPositionedNodesByXCoord
} from '../content/positioned/positionedEntityHelpers';
import { windowed } from '../util/objTransforms';
import {
  determineNaturalParentNodePosition, sliceOffsetAndWidth, StrWidthFunc
} from '../content/positioned/positioning';
import { PositionedTree, PositionInTree } from '../content/positioned/types';

const MAX_TRIGGER_WIDTH = 32;
const MAX_TRIGGER_PADDING_TOP = 28;
const MAX_TRIGGER_PADDING_BOTTOM = 20;

type ChildIdsOrSlice = { childIds: Id[], childPositions: PositionInTree[] } | { slice: StringSlice };

type NodeCreationTarget = ChildIdsOrSlice & {
  position: PositionInTree;
};

export type NodeCreationTrigger = ChildIdsOrSlice & {
  origin: PositionInTree;
  topLeft: PositionInTree;
  bottomRight: PositionInTree;
};

const getWordSlices = (sentence: Sentence, wordRegex?: RegExp): StringSlice[] => {
  const _wordRegex = wordRegex || /['A-Za-z\u00c0-\u1fff]+/g;
  const match = _wordRegex.exec(sentence);
  if (!match) return [];
  const sliceStart = match.index;
  const sliceEnd = sliceStart + match[0].length;
  const nextSlices = getWordSlices(sentence, _wordRegex);  // The next time exec is called it will return the next word
  return [[sliceStart, sliceEnd], ...nextSlices];
};

const getNodeCreationTargetsForTree = (strWidthFunc: StrWidthFunc) => (positionedTree: PositionedTree): NodeCreationTarget[] => {
  // We only need node creation triggers to add parent nodes for top-level nodes, so discard the rest
  const topLevelNodes = getTopLevelPositionedNodes(positionedTree);
  const topLevelNodeIds = sortPositionedNodesByXCoord(positionedTree)(Object.keys(topLevelNodes));

  // We also need one trigger above each space between two horizontally adjacent nodes
  const topLevelNodeIdPairs = windowed(topLevelNodeIds, 2);

  // Finally, we need one trigger for each word that isn't already assigned to a terminal node
  const unassignedSlices = getWordSlices(positionedTree.sentence).filter(isSliceUnassigned(positionedTree));

  // Find the targets for all of these triggers, i.e. where nodes can be added
  const parentNodeCreationTargets: NodeCreationTarget[] = topLevelNodeIds.map(id => [id]).concat(topLevelNodeIdPairs)
    .map(nodeIds => ({
      position: determineNaturalParentNodePosition(nodeIds.map(nodeId => positionedTree.nodes[nodeId].position)),
      childIds: nodeIds,
      childPositions: nodeIds.map(nodeId => positionedTree.nodes[nodeId].position),
    }));
  const terminalNodeCreationTargets: NodeCreationTarget[] = unassignedSlices.map(slice => {
    const [widthBeforeSlice, sliceWidth] = sliceOffsetAndWidth(strWidthFunc)(positionedTree.sentence)(slice);
    return {
      position: { treeX: widthBeforeSlice + (sliceWidth / 2), treeY: -MAX_TRIGGER_PADDING_BOTTOM },
      slice,
    };
  });

  return parentNodeCreationTargets.concat(terminalNodeCreationTargets);
};

export const getNodeCreationTriggersForTree =
  (strWidthFunc: StrWidthFunc) =>
  (positionedTree: PositionedTree): NodeCreationTrigger[] =>
    getNodeCreationTargetsForTree(strWidthFunc)(positionedTree).map(target => ({
      origin: target.position,
      topLeft: {
        treeX: target.position.treeX - MAX_TRIGGER_WIDTH / 2,
        treeY: target.position.treeY - MAX_TRIGGER_PADDING_TOP,
      },
      bottomRight: {
        treeX: target.position.treeX + MAX_TRIGGER_WIDTH / 2,
        treeY: target.position.treeY + MAX_TRIGGER_PADDING_BOTTOM,
      },
      ...(
        'childIds' in target
          ? { childIds: target.childIds, childPositions: target.childPositions }
          : { slice: target.slice }
      ),
    }));
