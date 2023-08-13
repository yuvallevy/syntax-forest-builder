import { createContext } from 'react';
import { initialUiState, UiAction, UiState } from 'npbloom-core';

const UiStateContext = createContext<{
  state: UiState;
  dispatch: React.Dispatch<UiAction>;
}>({
  state: initialUiState.get(),
  dispatch: () => undefined,
});

export default UiStateContext;
