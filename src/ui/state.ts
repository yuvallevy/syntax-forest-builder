import { union } from '../core/objTransforms';
import { Id, IdMap, UnpositionedPlot } from '../core/types';
import UndoRedoHistory, { UndoableActionCommon } from '../mantle/UndoRedoHistory';

type UiAction =
  | { type: 'selectNodes', plotId: Id, treeIds: Id[], nodeIds: Id[], mode: 'set' | 'add' }
;

export type UndoableUiAction = UndoableActionCommon & UiAction;

export const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'selectNodes':
      return {
        ...state,
        activePlotId: action.plotId,
        selectedTreeIds: action.mode === 'add' ? union(state.selectedTreeIds, action.treeIds) : action.treeIds,
        selectedNodeIds: action.mode === 'add' ? union(state.selectedNodeIds, action.nodeIds) : action.nodeIds,
      };
    default:
      return state;
  }
};

export type UiState = {
  plots: IdMap<UnpositionedPlot>;
  activePlotId: Id;
  selectedTreeIds: Id[];
  selectedNodeIds: Id[];
};

export type UndoableUiState = UndoRedoHistory<UndoableUiAction, UiState>;

export const initialState: UiState = {
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
