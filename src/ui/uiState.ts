import {
  Id, NodeLabel, Sentence, StringSlice, NodeIndicatorInPlot, PlotIndex
} from '../content/types';
import * as UndoRedoHistory from '../util/UndoRedoHistory';
import { newNodeFromSelection } from './content/editNodes';
import { contentReducer, initialContentState, UndoableContentState } from './content/contentState';
import { getNodeIdsAssignedToSlice } from '../content/unpositioned/manipulation';
import { getParentNodeIdsInPlot } from '../content/unpositioned/plotManipulation';
import { sortNodesByXCoord } from '../content/positioned/positioning';
import {
  isNodeSelection, isSliceSelection, NodeSelectionAction, NodeSelectionInPlot, pruneSelection, SelectionInPlot
} from './selection';
import strWidth from './strWidth';
import { isBranching, isTerminal, PlotCoordsOffset, UnpositionedPlot } from '../content/unpositioned/types';

export type UiAction =
  | { type: 'setActivePlotIndex', newPlotIndex: PlotIndex }
  | { type: 'addPlot' }
  | { type: 'setSelection', newSelection: SelectionInPlot }
  | { type: 'selectParentNodes' }
  | { type: 'selectChildNode', side: 'left' | 'right' | 'center' }
  | { type: 'startEditing' }
  | { type: 'stopEditing' }
  | { type: 'setEditedNodeLabel', newLabel: NodeLabel }
  | { type: 'setSelectionAction', selectionAction: NodeSelectionAction }
  | { type: 'addNodeBySelection', newNodeId: Id }
  | { type: 'addNodeByTarget', treeId: Id, newNodeId: Id, targetChildIds: Id[] }
  | { type: 'addNodeByTarget', treeId: Id, newNodeId: Id, targetSlice: StringSlice }
  | { type: 'deleteSelectedNodes' }
  | { type: 'adoptNodesBySelection', adoptedNodeIndicators: NodeIndicatorInPlot[] }
  | { type: 'disownNodesBySelection', disownedNodeIndicators: NodeIndicatorInPlot[] }
  | { type: 'moveSelectedNodes', dx: number, dy: number }
  | { type: 'resetSelectedNodePositions' }
  | { type: 'toggleTriangle' }
  | { type: 'setSentence', newSentence: Sentence, oldSelectedSlice: StringSlice, treeId?: Id }
  | { type: 'addTree', newTreeId: Id, offset: PlotCoordsOffset }
  | { type: 'removeTree', treeId: Id }
  | { type: 'undo' }
  | { type: 'redo' }
;

export type UiState = {
  contentState: UndoableContentState;
  activePlotIndex: PlotIndex;
  selection: SelectionInPlot;
  selectionAction: NodeSelectionAction;
  editedNodeIndicator?: NodeIndicatorInPlot;
};

export const initialUiState: UiState = {
  activePlotIndex: 0,
  contentState: initialContentState,
  selection: { nodeIndicators: [] },
  selectionAction: 'select',
};

export const canUndo = (state: UiState) => UndoRedoHistory.canUndo(state.contentState);
export const canRedo = (state: UiState) => UndoRedoHistory.canRedo(state.contentState);

const selectParentNodes = (activePlot: UnpositionedPlot, selection: SelectionInPlot): NodeSelectionInPlot => {
  if (isSliceSelection(selection)) {
    return {
      nodeIndicators: getNodeIdsAssignedToSlice(selection.slice)(activePlot.trees[selection.treeId])
        .map(nodeId => ({ treeId: selection.treeId, nodeId }))
    };
  } else {
    if (selection.nodeIndicators.length === 0) return selection;
    const parentNodes = getParentNodeIdsInPlot(selection.nodeIndicators)(activePlot);
    return { nodeIndicators: parentNodes };
  }
};

export const uiReducer = (state: UiState, action: UiAction): UiState => {
  const activePlot = state.contentState.current.plots[state.activePlotIndex];
  const selectedTreeId =
    isSliceSelection(state.selection) ? state.selection.treeId
      : state.selection.nodeIndicators.length > 0 ? state.selection.nodeIndicators[0].treeId
      : undefined;
  switch (action.type) {
    case 'setActivePlotIndex':
      return {
        ...state,
        activePlotIndex: action.newPlotIndex,
        selection: { nodeIndicators: [] },
        selectionAction: 'select',
        editedNodeIndicator: undefined,
      };
    case 'addPlot':
      return {
        ...state,
        contentState: contentReducer(state.contentState, { type: 'addPlot' }),
        activePlotIndex: state.contentState.current.plots.length,
        selection: { nodeIndicators: [] },
        selectionAction: 'select',
        editedNodeIndicator: undefined,
      };
    case 'setSelection': {
      return {
        ...state,
        selection: action.newSelection,
        selectionAction: 'select',
      };
    }
    case 'selectParentNodes': {
      const parentSelection = selectParentNodes(activePlot, state.selection);
      return {
        ...state,
        selection: parentSelection,
        editedNodeIndicator: state.editedNodeIndicator ? parentSelection.nodeIndicators[0] : undefined,
      };
    }
    case 'selectChildNode': {
      if (
        !isNodeSelection(state.selection) ||  // no nodes selected
        (state.selection.nodeIndicators.length > 1) ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      const selectedNodeObject = activePlot.trees[selectedTreeId].nodes[state.selection.nodeIndicators[0].nodeId];
      if (!isBranching(selectedNodeObject)) return state;

      const childNodesSortedByX =
        sortNodesByXCoord(strWidth)(activePlot.trees[selectedTreeId])(selectedNodeObject.children);

      const childSelection: NodeSelectionInPlot | undefined =
        action.side === 'center' && selectedNodeObject.children.length === 1 ?
          { nodeIndicators: [{ treeId: selectedTreeId, nodeId: selectedNodeObject.children[0] }] } :
        action.side === 'center' && selectedNodeObject.children.length >= 3 ?
          { nodeIndicators: [{ treeId: selectedTreeId, nodeId: childNodesSortedByX[1] }] } :
        action.side !== 'center' && selectedNodeObject.children.length >= 2 ?
          {
            nodeIndicators: [
              {
                treeId: selectedTreeId,
                nodeId: childNodesSortedByX[action.side === 'left' ? 0 : (selectedNodeObject.children.length - 1)]
              }
            ]
          } : undefined;

      if (!childSelection) return state;
      return {
        ...state,
        selection: childSelection,
        editedNodeIndicator: state.editedNodeIndicator ? childSelection.nodeIndicators[0] : undefined,
      };
    }
    case 'startEditing': {
      if (!isNodeSelection(state.selection) || state.selection.nodeIndicators.length !== 1) return state;
      return {
        ...state,
        editedNodeIndicator: state.selection.nodeIndicators[0],
        selectionAction: 'select',
      };
    }
    case 'stopEditing': {
      return {
        ...state,
        editedNodeIndicator: undefined,
      };
    }
    case 'setEditedNodeLabel': {
      if (!state.editedNodeIndicator) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'setNodeLabel',
          plotIndex: state.activePlotIndex,
          nodeIndicator: state.editedNodeIndicator,
          newLabel: action.newLabel,
        }),
      };
    }
    case 'setSelectionAction': {
      return { ...state, selectionAction: action.selectionAction };
    }
    case 'addNodeBySelection': {
      if (!selectedTreeId) return state;
      const newNodeIndicator = { treeId: selectedTreeId, nodeId: action.newNodeId };
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'insertNode',
          plotIndex: state.activePlotIndex,
          treeId: selectedTreeId,
          newNodeId: action.newNodeId,
          newNode: newNodeFromSelection(state.selection, activePlot.trees[selectedTreeId].sentence),
        }),
        selection: { nodeIndicators: [newNodeIndicator] },
        selectionAction: 'select',
        editedNodeIndicator: newNodeIndicator,
      };
    }
    case 'addNodeByTarget': {
      const newNodeIndicator = { treeId: action.treeId, nodeId: action.newNodeId };
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'insertNode',
          plotIndex: state.activePlotIndex,
          treeId: action.treeId,
          newNodeId: action.newNodeId,
          newNode: { label: '', ...(
            'targetChildIds' in action
              ? { targetChildIds: action.targetChildIds }
              : { targetSlice: action.targetSlice }
            )
          },
        }),
        selection: { nodeIndicators: [newNodeIndicator] },
        selectionAction: 'select',
        editedNodeIndicator: newNodeIndicator,
      };
    }
    case 'deleteSelectedNodes': {
      if (!isNodeSelection(state.selection)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'deleteNodes',
          plotIndex: state.activePlotIndex,
          nodeIndicators: state.selection.nodeIndicators,
        }),
        selection: { nodeIndicators: [] },
        selectionAction: 'select',
      };
    }
    case 'adoptNodesBySelection': {
      if (
        !isNodeSelection(state.selection) ||  // no nodes selected
        (state.selection.nodeIndicators.length > 1) ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'adoptNodes',
          plotIndex: state.activePlotIndex,
          treeId: selectedTreeId,
          adoptingNodeId: state.selection.nodeIndicators[0].nodeId,
          adoptedNodeIds: action.adoptedNodeIndicators
            .filter(({ treeId }) => treeId === selectedTreeId).map(({ nodeId }) => nodeId),
        }),
        selectionAction: 'select',
      };
    }
    case 'disownNodesBySelection': {
      if (
        !isNodeSelection(state.selection) ||  // no nodes selected
        (state.selection.nodeIndicators.length > 1) ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'disownNodes',
          plotIndex: state.activePlotIndex,
          treeId: selectedTreeId,
          disowningNodeId: state.selection.nodeIndicators[0].nodeId,
          disownedNodeIds: action.disownedNodeIndicators
            .filter(({ treeId }) => treeId === selectedTreeId).map(({ nodeId }) => nodeId),
        }),
        selectionAction: 'select',
      };
    }
    case 'moveSelectedNodes': {
      if (!isNodeSelection(state.selection)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'moveNodes',
          plotIndex: state.activePlotIndex,
          nodeIndicators: state.selection.nodeIndicators,
          dx: action.dx,
          dy: action.dy,
        }),
      }
    }
    case 'resetSelectedNodePositions': {
      if (!isNodeSelection(state.selection)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'resetNodePositions',
          plotIndex: state.activePlotIndex,
          nodeIndicators: state.selection.nodeIndicators,
        }),
      };
    }
    case 'toggleTriangle': {
      if (!isNodeSelection(state.selection)) return state;
      const currentlyTriangle = state.selection.nodeIndicators.every(({ treeId, nodeId }) => {
        const node = activePlot.trees[treeId].nodes[nodeId];
        return isTerminal(node) ? node.triangle : false;
      });
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'setTriangle',
          plotIndex: state.activePlotIndex,
          nodeIndicators: state.selection.nodeIndicators,
          triangle: !currentlyTriangle,
        }),
      }
    }
    case 'setSentence': {
      if (!selectedTreeId) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'setSentence',
          plotIndex: state.activePlotIndex,
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
          plotIndex: state.activePlotIndex,
          newTreeId: action.newTreeId,
          offset: action.offset,
        }),
        selectionAction: 'select',
      };
    }
    case 'removeTree': {
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'removeTree',
          plotIndex: state.activePlotIndex,
          treeId: action.treeId,
        }),
        selectionAction: 'select',
      };
    }
    case 'undo':
    case 'redo': {
      const newContentState = contentReducer(state.contentState, action);
      return {
        ...state,
        contentState: newContentState,
        selection: pruneSelection(state.selection, newContentState.current.plots[state.activePlotIndex]),
      };
    }
  }
};
