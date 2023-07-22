import { useReducer } from 'react';
import { initialUiState, uiReducer } from './ui/uiState';
import UiStateContext from './ui/UiStateContext';
import App from './App';

const AppWithContext: React.FC = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState);

  return (
    <UiStateContext.Provider value={{ state, dispatch }}>
      <App />
    </UiStateContext.Provider>
  );
};

export default AppWithContext;
