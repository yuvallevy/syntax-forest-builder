import {
  AddPlot, AddTree, AdoptNodes, arrayFromSet, contentReducer, DeleteNodes, DeletePlot, DisownNodes, DeleteTree,
  initialContentState, InsertedBranchingNode, InsertedTerminalNode, InsertNode, newNodeFromSelection,
  NodeIndicatorInPlot, NodeSelectionAction, NodeSelectionInPlot, MoveNodes, PlotCoordsOffset, pruneSelection, Redo,
  ResetNodePositions, ResetPlot, SelectionInPlot, set, SetNodeLabel, SetTriangle, SetSentence, SliceSelectionInPlot,
  sortNodesByXCoord, StringSlice, TreeCoordsOffset, Undo, UnpositionedBranchingNode, UnpositionedPlot,
  UnpositionedTerminalNode
} from 'npbloom-core';
import { Id, NodeLabel, PlotIndex, Sentence, UndoableContentState } from '../types';
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
  contentState: initialContentState.get(),
  selection: new NodeSelectionInPlot(),
  selectionAction: NodeSelectionAction.Select,
};

const selectParentNodes = (activePlot: UnpositionedPlot, selection: SelectionInPlot): NodeSelectionInPlot => {
  if (selection instanceof SliceSelectionInPlot) {
    return new NodeSelectionInPlot(
      set(arrayFromSet<Id>(activePlot.tree(selection.treeId).getNodeIdsAssignedToSlice(selection.slice))
        .map(nodeId => new NodeIndicatorInPlot(selection.treeId, nodeId)))
    );
  } else if (selection instanceof NodeSelectionInPlot) {
    if (selection.nodeIndicators.length === 0) return selection;
    return new NodeSelectionInPlot(activePlot.getParentNodeIds(selection.nodeIndicators));
  } else {
    return new NodeSelectionInPlot();
  }
};

export const uiReducer = (state: UiState, action: UiAction): UiState => {
  const activePlot = state.contentState.current.plots[state.activePlotIndex];
  const selectedTreeId =
    state.selection instanceof SliceSelectionInPlot ? state.selection.treeId
      : state.selection instanceof NodeSelectionInPlot && arrayFromSet(state.selection.nodeIndicators).length > 0
      ? arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators)[0].treeId
      : undefined;
  switch (action.type) {
    case 'setActivePlotIndex':
      return {
        ...state,
        activePlotIndex: action.newPlotIndex,
        selection: new NodeSelectionInPlot(),
        selectionAction: NodeSelectionAction.Select,
        editedNodeIndicator: undefined,
      };
    case 'addPlot':
      return {
        ...state,
        contentState: contentReducer(state.contentState, AddPlot.getInstance()),
        activePlotIndex: state.contentState.current.plots.length,
        selection: new NodeSelectionInPlot(),
        selectionAction: NodeSelectionAction.Select,
        editedNodeIndicator: undefined,
      };
    case 'deletePlot': {
      const isLastRemainingPlot = state.contentState.current.plots.length === 1;
      const newContentState = contentReducer(state.contentState,
        isLastRemainingPlot ? new ResetPlot(action.plotIndex) : new DeletePlot(action.plotIndex));
      const newActivePlotIndex = state.activePlotIndex < newContentState.current.plots.length ? state.activePlotIndex
        : newContentState.current.plots.length - 1;
      return {
        ...state,
        contentState: newContentState,
        activePlotIndex: newActivePlotIndex,
        selection: new NodeSelectionInPlot(),
        selectionAction: NodeSelectionAction.Select,
        editedNodeIndicator: undefined,
      };
    }
    case 'setSelection': {
      return {
        ...state,
        selection: action.newSelection,
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'selectParentNodes': {
      const parentSelection = selectParentNodes(activePlot, state.selection);
      return {
        ...state,
        selection: parentSelection,
        editedNodeIndicator: state.editedNodeIndicator
          ? arrayFromSet<NodeIndicatorInPlot>(parentSelection.nodeIndicators)[0] : undefined,
      };
    }
    case 'selectChildNode': {
      if (
        !(state.selection instanceof NodeSelectionInPlot) ||  // no nodes selected
        (state.selection.nodeIndicators.length > 1) ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      const selectedNodeObject = activePlot.tree(selectedTreeId)
        .node(arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators)[0].nodeId);
      if (!(selectedNodeObject instanceof UnpositionedBranchingNode)) return state;

      const selectedNodeChildren = arrayFromSet<Id>(selectedNodeObject.children);
      const childNodesSortedByX =
        sortNodesByXCoord(strWidth, activePlot.tree(selectedTreeId), selectedNodeObject.children);

      const childSelection: NodeSelectionInPlot | undefined =
        action.side === 'center' && selectedNodeChildren.length === 1 ?
          new NodeSelectionInPlot(set([new NodeIndicatorInPlot(selectedTreeId, selectedNodeChildren[0])])) :
        action.side === 'center' && selectedNodeChildren.length >= 3 ?
          new NodeSelectionInPlot(set([new NodeIndicatorInPlot(selectedTreeId, childNodesSortedByX[1])])) :
        action.side !== 'center' && selectedNodeChildren.length >= 2 ?
          new NodeSelectionInPlot(
            set([
              new NodeIndicatorInPlot(
                selectedTreeId,
                childNodesSortedByX[action.side === 'left' ? 0 : (selectedNodeChildren.length - 1)]
              )
            ])
          ) : undefined;

      if (!childSelection) return state;
      return {
        ...state,
        selection: childSelection,
        editedNodeIndicator: state.editedNodeIndicator
          ? arrayFromSet<NodeIndicatorInPlot>(childSelection.nodeIndicators)[0] : undefined,
      };
    }
    case 'startEditing': {
      if (!(state.selection instanceof NodeSelectionInPlot) ||
        arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators).length !== 1) return state;
      return {
        ...state,
        editedNodeIndicator: arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators)[0],
        selectionAction: NodeSelectionAction.Select,
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
        contentState: contentReducer(state.contentState, new SetNodeLabel(
          state.activePlotIndex,
          state.editedNodeIndicator,
          action.newLabel,
        )),
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
        contentState: contentReducer(state.contentState, new InsertNode(
          state.activePlotIndex,
          selectedTreeId,
          action.newNodeId,
          newNodeFromSelection(state.selection, activePlot.tree(selectedTreeId).sentence),
        )),
        selection: new NodeSelectionInPlot(set([newNodeIndicator])),
        selectionAction: NodeSelectionAction.Select,
        editedNodeIndicator: newNodeIndicator,
      };
    }
    case 'addNodeByTarget': {
      const newNodeIndicator = new NodeIndicatorInPlot(action.treeId, action.newNodeId);
      return {
        ...state,
        contentState: contentReducer(state.contentState, new InsertNode(
          state.activePlotIndex,
          action.treeId,
          action.newNodeId,
          'targetChildIds' in action
            ? new InsertedBranchingNode('', null, action.targetChildIds)
            : new InsertedTerminalNode('', null, action.targetSlice, action.triangle),
        )),
        selection: new NodeSelectionInPlot(set([newNodeIndicator])),
        selectionAction: NodeSelectionAction.Select,
        editedNodeIndicator: newNodeIndicator,
      };
    }
    case 'deleteSelectedNodes': {
      if (!(state.selection instanceof NodeSelectionInPlot)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new DeleteNodes(
          state.activePlotIndex,
          state.selection.nodeIndicators,
        )),
        selection: new NodeSelectionInPlot(set(
          without(
            arrayFromSet(activePlot.getChildNodeIds(state.selection.nodeIndicators)),
            // Currently selected nodes are about to be deleted, so they should not be selected after deletion
            // (this can happen when two deleted nodes are parent and child)
            arrayFromSet(state.selection.nodeIndicators),
          ),
        )),
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'adoptNodesBySelection': {
      if (
        !(state.selection instanceof NodeSelectionInPlot) ||  // no nodes selected
        arrayFromSet(state.selection.nodeIndicators).length > 1 ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new AdoptNodes(
          state.activePlotIndex,
          selectedTreeId,
          arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators)[0].nodeId,
          set(action.adoptedNodeIndicators
            .filter(({ treeId }) => treeId === selectedTreeId).map(({ nodeId }) => nodeId)),
        )),
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'disownNodesBySelection': {
      if (
        !(state.selection instanceof NodeSelectionInPlot) ||  // no nodes selected
        arrayFromSet(state.selection.nodeIndicators).length > 1 ||  // multiple nodes selected
        !selectedTreeId  // could not figure out tree ID for some other reason
      ) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new DisownNodes(
          state.activePlotIndex,
          selectedTreeId,
          arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators)[0].nodeId,
          set(action.disownedNodeIndicators
            .filter(({ treeId }) => treeId === selectedTreeId).map(({ nodeId }) => nodeId)),
        )),
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'moveSelectedNodes': {
      if (!(state.selection instanceof NodeSelectionInPlot)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new MoveNodes(
          state.activePlotIndex,
          state.selection.nodeIndicators,
          new TreeCoordsOffset(action.dx, action.dy),
        )),
      }
    }
    case 'resetSelectedNodePositions': {
      if (!(state.selection instanceof NodeSelectionInPlot)) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new ResetNodePositions(
          state.activePlotIndex,
          state.selection.nodeIndicators,
        )),
      };
    }
    case 'toggleTriangle': {
      if (!(state.selection instanceof NodeSelectionInPlot)) return state;
      const currentlyTriangle = arrayFromSet<NodeIndicatorInPlot>(state.selection.nodeIndicators).every(({ treeId, nodeId }) => {
        const node = activePlot.tree(treeId).node(nodeId);
        return node instanceof UnpositionedTerminalNode ? node.triangle : false;
      });
      return {
        ...state,
        contentState: contentReducer(state.contentState, new SetTriangle(
          state.activePlotIndex,
          state.selection.nodeIndicators,
          !currentlyTriangle,
        )),
      }
    }
    case 'setSentence': {
      if (!selectedTreeId) return state;
      return {
        ...state,
        contentState: contentReducer(state.contentState, new SetSentence(
          state.activePlotIndex,
          action.treeId || selectedTreeId,
          action.newSentence,
          action.oldSelectedSlice,
        )),
      };
    }
    case 'addTree': {
      return {
        ...state,
        contentState: contentReducer(state.contentState, new AddTree(
          state.activePlotIndex,
          action.newTreeId,
          action.offset,
        )),
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'removeTree': {
      return {
        ...state,
        contentState: contentReducer(state.contentState, new DeleteTree(
          state.activePlotIndex,
          action.treeId,
        )),
        selectionAction: NodeSelectionAction.Select,
      };
    }
    case 'undo':
    case 'redo': {
      const newContentState = contentReducer(state.contentState,
        action.type === 'undo' ? Undo.getInstance() : Redo.getInstance());
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
