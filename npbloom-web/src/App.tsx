import { useReducer } from 'react';
import { initialUiState, UiAction, uiReducer as uiReducerWithoutStrWidth, UiState } from 'npbloom-core';
import SettingsStateContext, { initialSettingsState, settingsReducer } from './SettingsStateContext';
import strWidthByChars from './strWidth/strWidthByChars';
import strWidthByMeasure from './strWidth/strWidthByMeasure';
import UiStateContext from './UiStateContext';
import UiRoot from './UiRoot';

const uiReducer = (state: UiState, action: UiAction) => uiReducerWithoutStrWidth(state, action, strWidthByChars);
const uiReducerLiveStrWidth = (state: UiState, action: UiAction) =>
  uiReducerWithoutStrWidth(state, action, strWidthByMeasure);

const App: React.FC = () => {
  const [settingsState, settingsDispatch] = useReducer(settingsReducer, initialSettingsState);
  const [state, dispatch] =
    useReducer(settingsState.liveStringWidth ? uiReducerLiveStrWidth : uiReducer, initialUiState.get());
  const strWidth = settingsState.liveStringWidth ? strWidthByMeasure : strWidthByChars;

  return (
    <SettingsStateContext.Provider value={{ settingsState, settingsDispatch, strWidth }}>
      <UiStateContext.Provider value={{ state, dispatch }}>
        <UiRoot />
      </UiStateContext.Provider>
    </SettingsStateContext.Provider>
  );
};

export default App;
