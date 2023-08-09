import {
  arrayFromSet, InsertedBranchingNode, InsertedTerminalNode, NodeIndicatorInPlot, PlotCoordsOffset, set,
  sortNodesByXCoord, StringSlice, UnpositionedPlot, UnpositionedBranchingNode, UnpositionedTerminalNode
} from 'npbloom-core';
import { Id, NodeLabel, PlotIndex, Sentence } from '../types';
import * as UndoRedoHistory from '../util/UndoRedoHistory';
import { newNodeFromSelection } from './content/editNodes';
import { contentReducer, initialContentState, UndoableContentState } from './content/contentState';
import {
  isNodeSelection, isSliceSelection, NodeSelectionAction, NodeSelectionInPlot, pruneSelection, SelectionInPlot
} from './selection';
import strWidth from './strWidth';
import { without } from '../util/objTransforms';

export type UiAction =
  | { type: 'setActivePlotIndex', newPlotIndex: PlotIndex }
  | { type: 'addPlot' }
  | { type: 'deletePlot', plotIndex: PlotIndex }
  | { type: 'setSelection', newSelection: SelectionInPlot }
  | { type: 'selectParentNodes' }
  | { type: 'selectChildNode', side: 'left' | 'right' | 'center' }
  | { type: 'startEditing' }
  | { type: 'stopEditing' }
  | { type: 'setEditedNodeLabel', newLabel: NodeLabel }
  | { type: 'setSelectionAction', selectionAction: NodeSelectionAction }
  | { type: 'addNodeBySelection', newNodeId: Id }
  | { type: 'addNodeByTarget', treeId: Id, newNodeId: Id, targetChildIds: Id[] }
  | { type: 'addNodeByTarget', treeId: Id, newNodeId: Id, targetSlice: StringSlice, triangle: boolean }
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
      nodeIndicators: arrayFromSet<Id>(activePlot.tree(selection.treeId).getNodeIdsAssignedToSlice(selection.slice))
        .map(nodeId => new NodeIndicatorInPlot(selection.treeId, nodeId))
    };
  } else {
    if (selection.nodeIndicators.length === 0) return selection;
    const parentNodes = activePlot.getParentNodeIds(selection.nodeIndicators);
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
    case 'deletePlot': {
      const isLastRemainingPlot = state.contentState.current.plots.length === 1;
      const newContentState = contentReducer(state.contentState,
        isLastRemainingPlot ? { ...action, type: 'resetPlot' } : action);
      const newActivePlotIndex = state.activePlotIndex < newContentState.current.plots.length ? state.activePlotIndex
        : newContentState.current.plots.length - 1;
      return {
        ...state,
        contentState: newContentState,
        activePlotIndex: newActivePlotIndex,
        selection: { nodeIndicators: [] },
        selectionAction: 'select',
        editedNodeIndicator: undefined,
      };
    }
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
      const selectedNodeObject = activePlot.tree(selectedTreeId).node(state.selection.nodeIndicators[0].nodeId);
      if (!(selectedNodeObject instanceof UnpositionedBranchingNode)) return state;

      const selectedNodeChildren = arrayFromSet<Id>(selectedNodeObject.children);
      const childNodesSortedByX =
        sortNodesByXCoord(strWidth, activePlot.tree(selectedTreeId), selectedNodeChildren);

      const childSelection: NodeSelectionInPlot | undefined =
        action.side === 'center' && selectedNodeChildren.length === 1 ?
          { nodeIndicators: [new NodeIndicatorInPlot(selectedTreeId, selectedNodeChildren[0])] } :
        action.side === 'center' && selectedNodeChildren.length >= 3 ?
          { nodeIndicators: [new NodeIndicatorInPlot(selectedTreeId, childNodesSortedByX[1])] } :
        action.side !== 'center' && selectedNodeChildren.length >= 2 ?
          {
            nodeIndicators: [
              new NodeIndicatorInPlot(
                selectedTreeId,
                childNodesSortedByX[action.side === 'left' ? 0 : (selectedNodeChildren.length - 1)]
              )
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
      const newNodeIndicator = new NodeIndicatorInPlot(selectedTreeId, action.newNodeId);
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'insertNode',
          plotIndex: state.activePlotIndex,
          treeId: selectedTreeId,
          newNodeId: action.newNodeId,
          newNode: newNodeFromSelection(state.selection, activePlot.tree(selectedTreeId).sentence),
        }),
        selection: { nodeIndicators: [newNodeIndicator] },
        selectionAction: 'select',
        editedNodeIndicator: newNodeIndicator,
      };
    }
    case 'addNodeByTarget': {
      const newNodeIndicator = new NodeIndicatorInPlot(action.treeId, action.newNodeId);
      return {
        ...state,
        contentState: contentReducer(state.contentState, {
          type: 'insertNode',
          plotIndex: state.activePlotIndex,
          treeId: action.treeId,
          newNodeId: action.newNodeId,
          newNode: 'targetChildIds' in action
            ? new InsertedBranchingNode('', null, set(action.targetChildIds))
            : new InsertedTerminalNode('', null, action.targetSlice, action.triangle),
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
        selection: {
          nodeIndicators: without(
            arrayFromSet(activePlot.getChildNodeIds(set(state.selection.nodeIndicators))),
            // Currently selected nodes are about to be deleted, so they should not be selected after deletion
            // (this can happen when two deleted nodes are parent and child)
            state.selection.nodeIndicators,
          ),
        },
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
        const node = activePlot.tree(treeId).node(nodeId);
        return node instanceof UnpositionedTerminalNode ? node.triangle : false;
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
      const newActivePlotIndex = state.activePlotIndex < newContentState.current.plots.length ? state.activePlotIndex
        : newContentState.current.plots.length - 1;
      return {
        ...state,
        contentState: newContentState,
        activePlotIndex: newActivePlotIndex,
        selection: pruneSelection(state.selection, newContentState.current.plots[newActivePlotIndex]),
      };
    }
  }
};