import { UiAction, UiState, undoableReducer, UndoableUiState } from '../../ui/state';

describe('UI state', () => {
  const initialState: UiState = {
    plots: {},
    activePlotId: 'abc',
    selectedTreeIds: ['pqr'],
    selectedNodeIds: ['wxy'],
  };

  const undoableInitialState: UndoableUiState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, UiAction][] = [
    [
      'selects one node replacing current selection',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'set' }
    ],
    [
      'selects one node adding to current selection',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'add' }
    ],
    [
      'selects two nodes replacing current selection',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'set' }
    ],
    [
      'selects two nodes adding to current selection',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'add' }
    ],
    [
      'selects two nodes replacing current selection where one node is already selected',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'set' }
    ],
    [
      'selects two nodes adding to current selection where one node is already selected',
      { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'add' }
    ],
  ];

  it.each(testCases)('%s', (name, action) => expect(undoableReducer(undoableInitialState, action).current).toMatchSnapshot());
});