import { Id, Sentence, StrWidthFunc } from '../types';
import {
  CoordsInTree, determineNaturalParentNodePosition, getTopLevelPositionedNodes, idMapKeys, isSliceUnassigned,
  PositionedTree, set, sliceOffsetAndWidth, sortPositionedNodesByXCoord, StringSlice
} from 'npbloom-core';
import { windowed } from '../util/objTransforms';

const MAX_TRIGGER_WIDTH = 32;
const MAX_TRIGGER_PADDING_TOP = 28;
const MAX_TRIGGER_PADDING_BOTTOM = 20;

type ChildIdsOrSlice = { childIds: Id[], childPositions: CoordsInTree[] } | { slice: StringSlice };

type NodeCreationTarget = ChildIdsOrSlice & {
  position: CoordsInTree;
};

export type NodeCreationTrigger = ChildIdsOrSlice & {
  origin: CoordsInTree;
  topLeft: CoordsInTree;
  bottomRight: CoordsInTree;
};

const getWordSlices = (sentence: Sentence, wordRegex?: RegExp): StringSlice[] => {
  const _wordRegex = wordRegex || /['A-Za-z\u00c0-\u1fff]+/g;
  const match = _wordRegex.exec(sentence);
  if (!match) return [];
  const sliceStart = match.index;
  const sliceEnd = sliceStart + match[0].length;
  const nextSlices = getWordSlices(sentence, _wordRegex);  // The next time exec is called it will return the next word
  return [new StringSlice(sliceStart, sliceEnd), ...nextSlices];
};

const getNodeCreationTargetsForTree = (strWidthFunc: StrWidthFunc) => (positionedTree: PositionedTree): NodeCreationTarget[] => {
  // We only need node creation triggers to add parent nodes for top-level nodes, so discard the rest
  const topLevelNodes = getTopLevelPositionedNodes(positionedTree);
  const topLevelNodeIds = sortPositionedNodesByXCoord(positionedTree, idMapKeys(topLevelNodes));

  // We also need one trigger above each space between two horizontally adjacent nodes
  const topLevelNodeIdPairs = windowed(topLevelNodeIds, 2);

  // Finally, we need one trigger for each word that isn't already assigned to a terminal node
  const unassignedSlices = getWordSlices(positionedTree.sentence).filter(slice => isSliceUnassigned(positionedTree, slice));

  // Find the targets for all of these triggers, i.e. where nodes can be added
  const parentNodeCreationTargets: NodeCreationTarget[] = topLevelNodeIds.map(id => [id]).concat(topLevelNodeIdPairs)
    .map(nodeIds => ({
      position: determineNaturalParentNodePosition(set(nodeIds.map(nodeId => positionedTree.node(nodeId).position))),
      childIds: nodeIds,
      childPositions: nodeIds.map(nodeId => positionedTree.node(nodeId).position),
    }));
  const terminalNodeCreationTargets: NodeCreationTarget[] = unassignedSlices.map(slice => {
    const [widthBeforeSlice, sliceWidth] = sliceOffsetAndWidth(strWidthFunc, positionedTree.sentence, slice);
    return {
      position: new CoordsInTree(widthBeforeSlice + (sliceWidth / 2), -MAX_TRIGGER_PADDING_BOTTOM),
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
      topLeft: new CoordsInTree(
        target.position.treeX - MAX_TRIGGER_WIDTH / 2,
        target.position.treeY - MAX_TRIGGER_PADDING_TOP,
      ),
      bottomRight: new CoordsInTree(
        target.position.treeX + MAX_TRIGGER_WIDTH / 2,
        target.position.treeY + MAX_TRIGGER_PADDING_BOTTOM,
      ),
      ...(
        'childIds' in target
          ? { childIds: target.childIds, childPositions: target.childPositions }
          : { slice: target.slice }
      ),
    }));
