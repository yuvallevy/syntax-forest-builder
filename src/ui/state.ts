import { union } from '../core/objTransforms';
import { Id, IdMap, UnpositionedPlot, UnpositionedTree } from '../core/types';
import { deleteNodesInTree, InsertedNode, insertNodeIntoTree } from '../mantle/manipulation';
import UndoRedoHistory, { ApplyActionFunc, applyToHistory, redo, ReverseActionFunc, undo, UndoableActionCommon } from '../mantle/UndoRedoHistory';

/**
 * Represents an action taken by the user.
 * To integrate with the undo/redo system, each action is translated into an undoable "state change",
 * which is subsequently applied in a reversible fashion.
 */
export type UiAction =
  | { type: 'selectNodes', plotId: Id, treeIds: Id[], nodeIds: Id[], mode: 'set' | 'add' }
  | { type: 'insertNode', plotId: Id, treeId: Id, newNodeId: Id, newNode: InsertedNode }
  | { type: 'deleteNodes', plotId: Id, treeId: Id, nodeIds: Id[] }
;

/**
 * Represents a change in state as a result of an action done by the user.
 * Each state change includes information about the state before it so it can be easily undone,
 * and each action by the user is translated into a state change so that undo/redo can work smoothly.
 */
type UiStateChange = (
  | {
    type: 'setSelectedNodes',
    old: {
      activePlotId: Id,
      selectedTreeIds: Id[],
      selectedNodeIds: Id[],
    },
    new: {
      activePlotId: Id,
      selectedTreeIds: Id[],
      selectedNodeIds: Id[],
    },
  }
  | {
    type: 'setTree',
    plotId: Id,
    treeId: Id,
    old: UnpositionedTree,
    new: UnpositionedTree,
  }
);

type UndoableUiStateChange = UndoableActionCommon & UiStateChange;

/**
 * Translates a user action into a state change, which can later be undone.
 */
const makeUndoable = (state: UiState) => (action: UiAction): UiStateChange => {
  switch (action.type) {
    case 'selectNodes':
      return {
        type: 'setSelectedNodes',
        old: {
          activePlotId: state.activePlotId,
          selectedTreeIds: state.selectedTreeIds,
          selectedNodeIds: state.selectedNodeIds,
        },
        new: {
          activePlotId: action.plotId,
          selectedTreeIds: action.mode === 'add' ? union(state.selectedTreeIds, action.treeIds) : action.treeIds,
          selectedNodeIds: action.mode === 'add' ? union(state.selectedNodeIds, action.nodeIds) : action.nodeIds,
        }
      };
    case 'insertNode':
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: insertNodeIntoTree(action.newNode)(action.newNodeId)(state.plots[action.plotId].trees[action.treeId]),
      };
    case 'deleteNodes':
      return {
        type: 'setTree',
        plotId: action.plotId,
        treeId: action.treeId,
        old: state.plots[action.plotId].trees[action.treeId],
        new: deleteNodesInTree(action.nodeIds)(state.plots[action.plotId].trees[action.treeId]),
      };
  }
};

const applyUndoableAction: ApplyActionFunc<UndoableUiStateChange, UiState> = action => state => {
  switch (action.type) {
    case 'setSelectedNodes':
      return { ...state, ...action.new };
    case 'setTree':
      return {
        ...state,
        plots: {
          ...state.plots,
          [action.plotId]: {
            ...state.plots[action.plotId],
            trees: {
              ...state.plots[action.plotId].trees,
              [action.treeId]: action.new,
            },
          },
        },
      };
    default:
      return state;
  }
};

const reverseUndoableAction: ReverseActionFunc<UndoableUiStateChange> = action => {
  switch (action.type) {
    case 'setSelectedNodes':
      return {
        ...action,
        old: action.new,
        new: action.old,
      };
    case 'setTree':
      return {
        ...action,
        old: action.new,
        new: action.old,
      };
    default:
      return action;
  }
};

export type UiState = {
  plots: IdMap<UnpositionedPlot>;
  activePlotId: Id;
  selectedTreeIds: Id[];
  selectedNodeIds: Id[];
};

export type UndoableUiState = UndoRedoHistory<UndoableUiStateChange, UiState>;

const initialState: UiState = {
  plots: {
    'plot': {
      trees: {
        'aa': {
          sentence: 'Noun verbs very adverbly.',
          nodes: {
            // 'a': {
            //   label: 'S', offset: { dTreeX: 0, dTreeY: 0 }, children: {
                'b': {
                  label: 'NP', offset: { dTreeX: 0, dTreeY: -10 }, children: {
                    'c': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
                  }
                },
                'd': {
                  label: 'VP', offset: { dTreeX: 0, dTreeY: 0 }, children: {
                    'e': { label: 'V', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
                    'f': { label: 'AdvP', offset: { dTreeX: 0, dTreeY: 0 }, slice: [11, 24], triangle: true },
                  }
                },
            //   }
            // },
          },
          offset: { dPlotX: 200, dPlotY: 250 },
        },
      },
    },
  },
  activePlotId: 'plot',
  selectedTreeIds: [],
  selectedNodeIds: [],
};

export const undoableInitialState: UndoableUiState = {
  current: initialState,
  undoStack: [],
  redoStack: [],
};

export const undoableReducer = (state: UndoableUiState, action: UiAction | { type: 'undo' } | { type: 'redo' }): UndoableUiState =>
  action.type === 'undo' ? undo(applyUndoableAction)(reverseUndoableAction)(state)
    : action.type === 'redo' ? redo(applyUndoableAction)(reverseUndoableAction)(state)
    : applyToHistory(applyUndoableAction)({ ...makeUndoable(state.current)(action), timestamp: new Date() })(state);
