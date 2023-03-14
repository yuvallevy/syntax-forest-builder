import { UiAction, UiState, undoableReducer, UndoableUiState } from '../../ui/state';

describe('UI state', () => {
  const initialState: UiState = {
    plots: {},
    activePlotId: 'abc',
    selectedNodes: [{ treeId: 'pqr', nodeId: 'wxy' }],
  };

  const undoableInitialState: UndoableUiState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, UiAction][] = [
    [
      'selects one node replacing current selection',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'xyz' }], mode: 'set' }
    ],
    [
      'selects one node adding to current selection',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'xyz' }], mode: 'add' }
    ],
    [
      'selects two nodes replacing current selection',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'vwx' }, { treeId: 'pqr', nodeId: 'xyz' }], mode: 'set' }
    ],
    [
      'selects two nodes adding to current selection',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'vwx' }, { treeId: 'pqr', nodeId: 'xyz' }], mode: 'add' }
    ],
    [
      'selects two nodes replacing current selection where one node is already selected',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'wxy' }, { treeId: 'pqr', nodeId: 'xyz' }], mode: 'set' }
    ],
    [
      'selects two nodes adding to current selection where one node is already selected',
      { type: 'selectNodes', plotId: 'abc', nodes: [{ treeId: 'pqr', nodeId: 'wxy' }, { treeId: 'pqr', nodeId: 'xyz' }], mode: 'add' }
    ],
  ];

  it.each(testCases)('%s', (name, action) => expect(undoableReducer(undoableInitialState, action).current).toMatchSnapshot());
});