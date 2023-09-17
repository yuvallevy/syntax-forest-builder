import { createContext } from 'react';
import { SettingsAction, settingsReducer as settingsReducerWithoutLocalStorage, SettingsState } from 'npbloom-core';
import strWidthByChars from './strWidth/strWidthByChars';
import strWidthByMeasure from './strWidth/strWidthByMeasure';

export const initialSettingsState = new SettingsState(
  localStorage['nb_autoFormatSubscript'] === 'true' || !localStorage['nb_autoFormatSubscript'],
  localStorage['nb_liveStringWidth'] === 'true',
);

export const settingsReducer = (state: SettingsState, action: SettingsAction) => {
  localStorage[`nb_${action.key}`] = action.value;
  return settingsReducerWithoutLocalStorage(state, action);
};

const SettingsStateContext = createContext<{
  settingsState: SettingsState;
  settingsDispatch: React.Dispatch<SettingsAction>;
  strWidth: (str: string) => number;
}>({
  settingsState: initialSettingsState,
  settingsDispatch: () => undefined,
  strWidth: initialSettingsState.liveStringWidth ? strWidthByMeasure : strWidthByChars,
});

export default SettingsStateContext;
