import { Id, NodeLabel } from '../../types';
import {
  AddNodeBySelection, calculateNodeCenterOnPlot, ClientCoords, generateNodeId, plotCoordsToClientCoords, PositionedTree,
  SelectParentNodes, set, SetEditedNodeLabel, StopEditing
} from 'npbloom-core';
import { useState } from 'react';
import './LabelNodeEditor.scss';
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

  const editedNodeObject = tree.node(nodeId);
  const nodePositionOnPlot = plotCoordsToClientCoords(calculateNodeCenterOnPlot(tree, editedNodeObject));
  const [inputValue, setInputValue] = useState<string>(editedNodeObject.label);

  const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];

  const selectParentNodes = () => dispatch(new SelectParentNodes());
  const stopEditing = () => dispatch(new StopEditing());
  const setEditedNodeLabel = (newLabel: NodeLabel) => dispatch(new SetEditedNodeLabel(newLabel));
  const addNode = () => dispatch(new AddNodeBySelection(generateNodeId()));

  const handleNodeEditorBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setEditedNodeLabel(event.currentTarget.value);
    stopEditing();
  };

  const handleNodeEditorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!state.editedNodeIndicator) return;
    if (event.key === 'ArrowUp') {
      setEditedNodeLabel(event.currentTarget.value);
      if (unpositionedPlot.allTopLevel(set([state.editedNodeIndicator]))) {
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
