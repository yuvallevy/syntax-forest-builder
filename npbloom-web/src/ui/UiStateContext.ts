import { createContext } from 'react';
import { initialUiState, UiAction, UiState } from './uiState';

const UiStateContext = createContext<{
  state: UiState;
  dispatch: React.Dispatch<UiAction>;
}>({
  state: initialUiState,
  dispatch: () => undefined,
});

export default UiStateContext;
