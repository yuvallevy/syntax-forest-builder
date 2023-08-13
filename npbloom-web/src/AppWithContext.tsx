import { useReducer } from 'react';
import { initialUiState, UiAction, uiReducer as uiReducerWithoutStrWidth, UiState } from 'npbloom-core';
import strWidth from './ui/strWidth';
import UiStateContext from './ui/UiStateContext';
import App from './App';

const uiReducer = (state: UiState, action: UiAction) => uiReducerWithoutStrWidth(state, action, strWidth)

const AppWithContext: React.FC = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState.get());

  return (
    <UiStateContext.Provider value={{ state, dispatch }}>
      <App />
    </UiStateContext.Provider>
  );
};

export default AppWithContext;
