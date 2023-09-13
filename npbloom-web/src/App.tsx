import { useReducer } from 'react';
import { initialUiState, UiAction, uiReducer as uiReducerWithoutStrWidth, UiState } from 'npbloom-core';
import strWidth from './strWidth/strWidthByChars';
import UiStateContext from './UiStateContext';
import UiRoot from './UiRoot';

const uiReducer = (state: UiState, action: UiAction) => uiReducerWithoutStrWidth(state, action, strWidth)

const App: React.FC = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState.get());

  return (
    <UiStateContext.Provider value={{ state, dispatch }}>
      <UiRoot />
    </UiStateContext.Provider>
  );
};

export default App;
