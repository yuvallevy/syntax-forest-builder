import { UiState, reducer } from '../../ui/state';

describe('UI state', () => {
  const initialState: UiState = {
    plots: {},
    activePlotId: 'abc',
    selectedTreeIds: ['pqr'],
    selectedNodeIds: ['wxy'],
  };

  it('selects one node replacing current selection', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'set' }))
      .toMatchSnapshot();
  });

  it('selects one node adding to current selection', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['xyz'], mode: 'add' }))
      .toMatchSnapshot();
  });

  it('selects two nodes replacing current selection', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'set' }))
      .toMatchSnapshot();
  });

  it('selects two nodes adding to current selection', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['vwx', 'xyz'], mode: 'add' }))
      .toMatchSnapshot();
  });

  it('selects two nodes replacing current selection where one node is already selected', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'set' }))
      .toMatchSnapshot();
  });

  it('selects two nodes adding to current selection where one node is already selected', () => {
    expect(reducer(initialState, { type: 'selectNodes', plotId: 'abc', treeIds: ['pqr'], nodeIds: ['wxy', 'xyz'], mode: 'add' }))
      .toMatchSnapshot();
  });
});