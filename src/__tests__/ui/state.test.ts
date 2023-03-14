import { UiAction, UiState, undoableReducer, UndoableUiState } from '../../ui/state';

describe('UI state', () => {
  const initialState: UiState = {
    plots: {
      'plot': {
        trees: {
          'aa': {
            nodes: {
              'a': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [0, 4], triangle: false },
              'b': { label: 'N', offset: { dTreeX: 0, dTreeY: 0 }, slice: [5, 10], triangle: false },
            },
            offset: { dPlotX: 0, dPlotY: 0 },
            sentence: 'tree state',
          }
        }
      }
    },
  };

  const undoableInitialState: UndoableUiState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, UiAction][] = [
    [
      'inserts a node into a tree',
      { type: 'insertNode', plotId: 'plot', treeId: 'aa', newNodeId: 'c', newNode: { label: 'NP', targetChildIds: ['a', 'b'] } }
    ],
    [
      'deletes a node from a tree',
      { type: 'deleteNodes', plotId: 'plot', nodes: [{ treeId: 'aa', nodeId: 'b' }] }
    ],
    [
      'sets the label of a node',
      { type: 'setNodeLabel', plotId: 'plot', node: { treeId: 'aa', nodeId: 'a' }, newLabel: 'NP' }
    ],
  ];

  it.each(testCases)('%s', (name, action) => expect(undoableReducer(undoableInitialState, action).current).toMatchSnapshot());
});
