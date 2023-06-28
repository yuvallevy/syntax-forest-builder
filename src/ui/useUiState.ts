import { useContext } from 'react';
import UiStateContext from './UiStateContext';

const useUiState = () => {
  const { state, dispatch } = useContext(UiStateContext);

  return { state, dispatch };
}

export default useUiState;
