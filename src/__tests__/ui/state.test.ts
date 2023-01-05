import { UiState, undoableReducer, UndoableUiState } from '../../ui/state';

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

  it('selects one node replacing current selection', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'set' }).current)
      .toMatchSnapshot();
  });

  it('selects one node adding to current selection', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'add' }).current)
      .toMatchSnapshot();
  });

  it('selects two nodes replacing current selection', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'set' }).current)
      .toMatchSnapshot();
  });

  it('selects two nodes adding to current selection', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'add' }).current)
      .toMatchSnapshot();
  });

  it('selects two nodes replacing current selection where one node is already selected', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'set' }).current)
      .toMatchSnapshot();
  });

  it('selects two nodes adding to current selection where one node is already selected', () => {
    expect(undoableReducer(undoableInitialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'add' }).current)
      .toMatchSnapshot();
  });
});