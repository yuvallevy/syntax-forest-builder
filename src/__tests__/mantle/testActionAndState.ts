import { ApplyActionFunc, ActionCommon, ReverseActionFunc } from '../../mantle/UndoRedoHistory';

export type TestState = {
  valueNumber: number;
  valueString: string;
};

export type TestAction = ActionCommon & (
  {
    type: 'INCREMENT_NUMBER' | 'DECREMENT_NUMBER';
    difference: number;
  } | {
    type: 'SET_STRING';
    oldValue: string;
    newValue: string;
  }
);

export const applyAction: ApplyActionFunc<TestAction, TestState> = action => state => {
  switch (action.type) {
    case 'INCREMENT_NUMBER': return { ...state, valueNumber: state.valueNumber + action.difference }
    case 'DECREMENT_NUMBER': return { ...state, valueNumber: state.valueNumber - action.difference }
    case 'SET_STRING': return { ...state, valueString: action.newValue }
    default: return state;
  }
}

export const reverseAction: ReverseActionFunc<TestAction> = action => {
  switch (action.type) {
    case 'INCREMENT_NUMBER': return { ...action, type: 'DECREMENT_NUMBER' };
    case 'DECREMENT_NUMBER': return { ...action, type: 'INCREMENT_NUMBER' };
    case 'SET_STRING': return { ...action, oldValue: action.newValue, newValue: action.oldValue };
    default: return action;
  }
};
