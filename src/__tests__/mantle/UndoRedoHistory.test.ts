import UndoRedoHistory, { applyToHistory, redo, undo } from '../../mantle/UndoRedoHistory';
import { applyAction, reverseAction, TestAction, TestState } from './testActionAndState';

describe('undo/redo history', () => {
  const initialState: TestState = {
    valueNumber: 8,
    valueString: "alright very cool!",
  };
  
  const action1: TestAction = {
    type: 'SET_STRING',
    timestamp: new Date(1618033988749),
    oldValue: "alright very cool!",
    newValue: "alright cool!",
  };
  
  const action2: TestAction = {
    type: 'INCREMENT_NUMBER',
    timestamp: new Date(1618034000000),
    difference: 11,
  };

  const initialUndoRedoHistory: UndoRedoHistory<TestAction, TestState> = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const undoRedoHistoryAfterTwoActions: UndoRedoHistory<TestAction, TestState> = {
    current: { ...initialState, valueNumber: 19, valueString: 'alright cool!' },
    undoStack: [action2, action1],
    redoStack: [],
  };

  const undoRedoHistoryAfterUndoOnce: UndoRedoHistory<TestAction, TestState> = {
    current: { ...initialState, valueString: 'alright cool!' },
    undoStack: [action1],
    redoStack: [action2],
  };

  const undoRedoHistoryAfterUndoTwice: UndoRedoHistory<TestAction, TestState> = {
    current: { ...initialState },
    undoStack: [],
    redoStack: [action1, action2],
  };

  it('applies two actions and writes them to history', () => {
    const resultAfterFirst = applyToHistory(applyAction)(action1)(initialUndoRedoHistory);
    const resultAfterSecond = applyToHistory(applyAction)(action2)(resultAfterFirst);
    expect(resultAfterSecond).toStrictEqual(undoRedoHistoryAfterTwoActions);
  });

  it('undoes one action', () => {
    expect(undo(applyAction)(reverseAction)(undoRedoHistoryAfterTwoActions))
      .toStrictEqual(undoRedoHistoryAfterUndoOnce);
  });

  it('undoes two actions', () => {
    const resultAfterFirst = undo(applyAction)(reverseAction)(undoRedoHistoryAfterTwoActions);
    const resultAfterSecond = undo(applyAction)(reverseAction)(resultAfterFirst);
    expect(resultAfterSecond).toStrictEqual(undoRedoHistoryAfterUndoTwice);
  });

  it('undoes one action then redoes it', () => {
    const resultAfterUndo = undo(applyAction)(reverseAction)(undoRedoHistoryAfterTwoActions);
    const resultAfterRedo = redo(applyAction)(reverseAction)(resultAfterUndo);
    expect(resultAfterRedo).toStrictEqual(undoRedoHistoryAfterTwoActions);
  });

  it('undoes two actions then redoes one', () => {
    const resultAfterFirstUndo = undo(applyAction)(reverseAction)(undoRedoHistoryAfterTwoActions);
    const resultAfterSecondUndo = undo(applyAction)(reverseAction)(resultAfterFirstUndo);
    const resultAfterRedo = redo(applyAction)(reverseAction)(resultAfterSecondUndo);
    expect(resultAfterRedo).toStrictEqual(undoRedoHistoryAfterUndoOnce);
  });
});
