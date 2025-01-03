import { Id, NodeLabel } from '../types';
import {
  AddNodeBySelection, calculateNodeCenterOnPlot, CoordsInClient, generateNodeId, coordsInPlotToCoordsInClient,
  PositionedTree, SelectParentNodes, SetEditedNodeLabel, StopEditing
} from 'npbloom-core';
import { useState } from 'react';
import './LabelNodeEditor.scss';
import useUiState from '../useUiState';
import { SVG_X, SVG_Y } from '../uiDimensions';

interface LabelNodeEditorInputProps {
  value: string;
  baseCoords: CoordsInClient;
  fontSize: number;
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
  fontSize,
  onInput,
  onBlur,
  onKeyDown,
}) => <input
  type="text"
  className="LabelNodeEditorInput"
  value={value}
  autoFocus
  style={{ left: baseCoords.clientX + SVG_X, top: baseCoords.clientY + SVG_Y, fontSize }}
  onInput={e => onInput(e.currentTarget.value)}
  onBlur={onBlur}
  onKeyDown={onKeyDown}
/>;

const NODE_FONT_SIZE_PX = 16;
const LabelNodeEditor: React.FC<LabelNodeEditorProps> = ({
  tree,
  nodeId,
}) => {
  const { state, dispatch } = useUiState();

  const editedNodeObject = tree.node(nodeId);
  const nodePositionInClient =
    coordsInPlotToCoordsInClient(calculateNodeCenterOnPlot(tree, editedNodeObject), state.panZoomState);
  const nodeFontSize = NODE_FONT_SIZE_PX * state.panZoomState.zoomLevel;
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
      if (unpositionedPlot.allTopLevel([state.editedNodeIndicator])) {
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
    baseCoords={nodePositionInClient}
    fontSize={nodeFontSize}
    onInput={setInputValue}
    onBlur={handleNodeEditorBlur}
    onKeyDown={handleNodeEditorKeyDown}
  />;
};

export default LabelNodeEditor;
