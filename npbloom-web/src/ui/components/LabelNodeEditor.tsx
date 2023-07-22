import { Id, NodeLabel } from '../../content/types';
import { filterPositionedNodesInTreeById } from '../../content/positioned/positionedEntityHelpers';
import { calculateNodeCenterOnPlot, ClientCoords, plotCoordsToClientCoords } from '../coords';
import { useState } from 'react';
import { PositionedTree } from '../../content/positioned/types';
import { allTopLevelInPlot } from '../../content/unpositioned/plotManipulation';
import './LabelNodeEditor.scss';
import { generateNodeId } from '../content/generateId';
import useUiState from '../useUiState';

interface LabelNodeEditorInputProps {
  value: string;
  baseCoords: ClientCoords,
  onInput: (inputValue: string) => void;
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

interface LabelNodeEditorProps {
  tree: PositionedTree;
  nodeId: Id;
}

const LabelNodeEditorInput: React.FC<LabelNodeEditorInputProps> = ({
  value,
  baseCoords,
  onInput,
  onBlur,
  onKeyDown,
}) => <input
  type="text"
  className="LabelNodeEditorInput"
  value={value}
  autoFocus
  style={{ left: baseCoords.clientX, top: baseCoords.clientY }}
  onInput={e => onInput(e.currentTarget.value)}
  onBlur={onBlur}
  onKeyDown={onKeyDown}
/>;

const LabelNodeEditor: React.FC<LabelNodeEditorProps> = ({
  tree,
  nodeId,
}) => {
  const { state, dispatch } = useUiState();

  const editedNodeObject = filterPositionedNodesInTreeById([nodeId])(tree)[nodeId];
  const nodePositionOnPlot = plotCoordsToClientCoords(calculateNodeCenterOnPlot(tree)(editedNodeObject));
  const [inputValue, setInputValue] = useState<string>(editedNodeObject.label);

  const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];

  const selectParentNodes = () => dispatch({ type: 'selectParentNodes' });
  const stopEditing = () => dispatch({ type: 'stopEditing' });
  const setEditedNodeLabel = (newLabel: NodeLabel) => dispatch({ type: 'setEditedNodeLabel', newLabel });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });

  const handleNodeEditorBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setEditedNodeLabel(event.currentTarget.value);
    stopEditing();
  };

  const handleNodeEditorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!state.editedNodeIndicator) return;
    if (event.key === 'ArrowUp') {
      setEditedNodeLabel(event.currentTarget.value);
      if (allTopLevelInPlot([state.editedNodeIndicator])(unpositionedPlot)) {
        addNode();
      } else {
        selectParentNodes();
      }
    } else if (event.key === 'Enter') {
      setEditedNodeLabel(event.currentTarget.value);
      stopEditing();
    } else if (event.key === 'Escape') {
      stopEditing();
    }
  };

  return <LabelNodeEditorInput
    key={`editable-node-${nodeId}`}
    value={inputValue}
    baseCoords={nodePositionOnPlot}
    onInput={setInputValue}
    onBlur={handleNodeEditorBlur}
    onKeyDown={handleNodeEditorKeyDown}
  />;
};

export default LabelNodeEditor;
