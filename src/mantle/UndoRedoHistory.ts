export type ActionCommon = {
  timestamp: Date;
};

export type ApplyActionFunc<A extends ActionCommon, S> = (action: A) => (state: S) => S;

export type ReverseActionFunc<A extends ActionCommon> = (action: A) => A;

export const applyToHistory =
  <A extends ActionCommon, S>(applyAction: ApplyActionFunc<A, S>) =>
  (action: A) =>
  (history: UndoRedoHistory<A, S>): UndoRedoHistory<A, S> =>
  ({
    current: applyAction(action)(history.current),
    undoStack: [action, ...history.undoStack],
    redoStack: [],
  });

export const undo =
  <A extends ActionCommon, S>(applyAction: ApplyActionFunc<A, S>) =>
  (reverseAction: ReverseActionFunc<A>) =>
  (history: UndoRedoHistory<A, S>): UndoRedoHistory<A, S> => ({
    current: applyAction(reverseAction(history.undoStack[0]))(history.current),
      undoStack: history.undoStack.slice(1),
    redoStack: [history.undoStack[0], ...history.redoStack],
  });

export const redo =
  <A extends ActionCommon, S>(applyAction: ApplyActionFunc<A, S>) =>
  (reverseAction: ReverseActionFunc<A>) =>
  (history: UndoRedoHistory<A, S>): UndoRedoHistory<A, S> => ({
    current: applyAction(history.redoStack[0])(history.current),
    undoStack: [history.redoStack[0], ...history.undoStack],
      redoStack: history.redoStack.slice(1),
  });

type UndoRedoHistory<A extends ActionCommon, S> = {
  current: S;
  undoStack: A[];
  redoStack: A[];
};

export default UndoRedoHistory;
