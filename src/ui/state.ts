import { Id, IdMap, UnpositionedPlot } from '../core/types';

export type UiState = {
  plots: IdMap<UnpositionedPlot>;
  activePlotId: Id;
  selectedTreeIds: Id[];
  selectedNodeIds: Id[];
};

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
