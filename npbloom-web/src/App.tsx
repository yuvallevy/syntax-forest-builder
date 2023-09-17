import { useReducer } from 'react';
import { initialUiState, UiAction, uiReducer as uiReducerWithoutStrWidth, UiState } from 'npbloom-core';
import SettingsStateContext, { initialSettingsState, settingsReducer } from './SettingsStateContext';
import strWidth from './strWidth/strWidthByChars';
import UiStateContext from './UiStateContext';
import UiRoot from './UiRoot';

const uiReducer = (state: UiState, action: UiAction) => uiReducerWithoutStrWidth(state, action, strWidth)

const App: React.FC = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState.get());
  const [settingsState, settingsDispatch] = useReducer(settingsReducer, initialSettingsState);

  return (
    <SettingsStateContext.Provider value={{ settingsState, settingsDispatch }}>
      <UiStateContext.Provider value={{ state, dispatch }}>
        <UiRoot />
      </UiStateContext.Provider>
    </SettingsStateContext.Provider>
  );
};

export default App;
