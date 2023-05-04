import {
  Id, isBranching, NodeLabel, PlotCoordsOffset, Sentence, StringSlice, TreeAndNodeId, UnpositionedPlot
} from '../core/types';
import { newNodeFromSelection, NodeSelectionInPlot, SelectionInPlot } from './editNodes';
import { contentReducer, initialContentState, UndoableContentState } from './contentState';
import { getNodeIdsAssignedToSlice } from '../mantle/manipulation';
import { getParentNodeIdsInPlot } from '../mantle/plotManipulation';
import { sortNodesByXCoord } from '../core/positioning';
import strWidth from './strWidth';

export type UiAction =
  | { type: 'setSelection', newSelection: SelectionInPlot }
  | { type: 'selectParentNodes' }
  | { type: 'selectChildNode', side: 'left' | 'right' | 'center' }
  | { type: 'startEditing' }
  | { type: 'stopEditing' }
  | { type: 'setEditedNodeLabel', newLabel: NodeLabel }
  | { type: 'addNodeBySelection', newNodeId: Id }
  | { type: 'deleteSelectedNodes' }
  | { type: 'setSentence', newSentence: Sentence, oldSelectedSlice: StringSlice, treeId?: Id }
  | { type: 'addTree', newTreeId: Id, offset: PlotCoordsOffset }
  | { type: 'removeTree', treeId: Id }
  | { type: 'undo' }
  | { type: 'redo' }
;

export type UiState = {
  contentState: UndoableContentState;
  activePlotId: Id;
  selection: SelectionInPlot;
  editingNode?: TreeAndNodeId;
};

export const initialUiState: UiState = {
  activePlotId: 'plot',
  contentState: initialContentState,
  selection: { nodes: [] },
};

const selectParentNodes = (activePlot: UnpositionedPlot, selection: SelectionInPlot) => {
  if ('slice' in selection) {
    return {
      nodes: getNodeIdsAssignedToSlice(selection.slice)(activePlot.trees[selection.treeId])
        .map(nodeId => ({ treeId: selection.treeId, nodeId }))
    };
  } else {
    if (selection.nodes.length === 0) return selection;
    const parentNodes = getParentNodeIdsInPlot(selection.nodes)(activePlot);
    return { nodes: parentNodes };
  }
};

export const uiReducer = (state: UiState, action: UiAction): UiState => {
  const activePlot = state.contentState.current.plots[state.activePlotId];
  const selectedTreeId =
    'treeId' in state.selection ? state.selection.treeId
      : state.selection.nodes.length > 0 ? state.selection.nodes[0].treeId
      : undefined;
  switch (action.type) {
    case 'setSelection': {
      return {
        ...state,
        selection: action.newSelection,
      };
    }
    case 'selectParentNodes': {
      const parentSelection = selectParentNodes(activePlot, state.selection);
      return {
        ...state,
        selection: parentSelection,
        editingNode: state.editingNode ? parentSelection.nodes[0] : undefined,
      };
    }
    case 'selectChildNode': {
      if (
        !('nodes' in state.selection) ||  // no nodes selected
        ('nodes' in state.selection && state.selection.nodes.length > 1) ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      const selectedNode = activePlot.trees[selectedTreeId].nodes[state.selection.nodes[0].nodeId];
      if (!isBranching(selectedNode)) return state;

      const childNodesSortedByX = sortNodesByXCoord(strWidth)(activePlot.trees[selectedTreeId])(selectedNode.children);

      const childSelection: NodeSelectionInPlot | undefined =
        action.side === 'center' && selectedNode.children.length === 1 ?
          { nodes: [{ treeId: selectedTreeId, nodeId: selectedNode.children[0] }] } :
        action.side === 'center' && selectedNode.children.length >= 3 ?
          { nodes: [{ treeId: selectedTreeId, nodeId: childNodesSortedByX[1] }] } :
        action.side !== 'center' && selectedNode.children.length >= 2 ?
          {
            nodes: [
              {
                treeId: selectedTreeId,
                nodeId: childNodesSortedByX[action.side === 'left' ? 0 : (selectedNode.children.length - 1)]
              }
            ]
          } : undefined;

      if (!childSelection) return state;
      return {
        ...state,
        selection: childSelection,
        editingNode: state.editingNode ? childSelection.nodes[0] : undefined,
      };
    }
    case 'startEditing': {
      if (!('nodes' in state.selection) || state.selection.nodes.length !== 1) return state;
      return {
        ...state,
        editingNode: state.selection.nodes[0],
      };
    }
    case 'stopEditing': {
      return {
        ...state,
        editingNode: undefined,
      };
    }
    case 'setEditedNodeLabel': {
      if (!state.editingNode) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'setNodeLabel',
          plotId: state.activePlotId,
          node: state.editingNode,
          newLabel: action.newLabel,
        }),
      };
    }
    case 'addNodeBySelection': {
      if (!selectedTreeId) return state;
      const newNodeIndicator = { treeId: selectedTreeId, nodeId: action.newNodeId };
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'insertNode',
          plotId: state.activePlotId,
          treeId: selectedTreeId,
          newNodeId: action.newNodeId,
          newNode: newNodeFromSelection(state.selection, activePlot.trees[selectedTreeId].sentence),
        }),
        selection: { nodes: [newNodeIndicator] },
        editingNode: newNodeIndicator,
      };
    }
    case 'deleteSelectedNodes': {
      if (!('nodes' in state.selection)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'deleteNodes',
          plotId: state.activePlotId,
          nodes: state.selection.nodes,
        }),
        selection: { nodes: [] },
      };
    }
    case 'setSentence': {
      if (!selectedTreeId) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'setSentence',
          plotId: state.activePlotId,
          treeId: action.treeId || selectedTreeId,
          newSentence: action.newSentence,
          oldSelectedSlice: action.oldSelectedSlice,
        }),
      };
    }
    case 'addTree': {
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'addTree',
          plotId: state.activePlotId,
          newTreeId: action.newTreeId,
          offset: action.offset,
        }),
      };
    }
    case 'removeTree': {
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'removeTree',
          plotId: state.activePlotId,
          treeId: action.treeId,
        }),
      };
    }
    default: {
      return {
        ...state,
        contentState: contentReducer(state.contentState, action)
      };
    }
  }
};
