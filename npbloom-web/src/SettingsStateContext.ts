import { createContext } from 'react';
import { SettingsAction, settingsReducer as settingsReducerWithoutLocalStorage, SettingsState } from 'npbloom-core';

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
}>({
  settingsState: initialSettingsState,
  settingsDispatch: () => undefined,
});

export default SettingsStateContext;
