import { union } from '../core/objTransforms';
import { Id, IdMap, UnpositionedPlot } from '../core/types';
import UndoRedoHistory, { ApplyActionFunc, applyToHistory, redo, ReverseActionFunc, undo, UndoableActionCommon } from '../mantle/UndoRedoHistory';

type UiAction =
  | { type: 'selectNodes', plotId: Id, treeIds: Id[], nodeIds: Id[], mode: 'set' | 'add' }
;

/**
 * Represents a change in state as a result of an action done by the user.
 * Each state change includes information about the state before it so it can be easily undone,
 * and each action by the user is translated into a state change so that undo/redo can work smoothly.
 */
type UndoableUiStateChange = UndoableActionCommon & (
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
);

/**
 * Translates a non-undoable user action into an undoable state change.
 */
const makeUndoable = (state: UiState) => (action: UiAction): Omit<UndoableUiStateChange, 'timestamp'> => {
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
  }
};

const applyUndoableAction: ApplyActionFunc<UndoableUiStateChange, UiState> = action => state => {
  switch (action.type) {
    case 'setSelectedNodes':
      return { ...state, ...action.new };
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
            'a': {
              label: 'S', offset: { dTreeX: 0, dTreeY: 0 }, children: {
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
              }
            },
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
