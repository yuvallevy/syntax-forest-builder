import { union } from '../core/objTransforms';
import { Id } from '../core/types';
import { UiState } from './state';

type UiAction =
  | { type: 'selectNodes', plotId: Id, treeIds: Id[], nodeIds: Id[], mode: 'set' | 'add' }
;

export const reducer = (state: UiState, action: UiAction): UiState => {
  switch (action.type) {
    case 'selectNodes':
      return {
        ...state,
        activePlotId: action.plotId,
        selectedTreeIds: action.mode === 'add' ? union(state.selectedTreeIds, action.treeIds) : action.treeIds,
        selectedNodeIds: action.mode === 'add' ? union(state.selectedNodeIds, action.nodeIds) : action.nodeIds,
      };
    default:
      return state;
  }
};
