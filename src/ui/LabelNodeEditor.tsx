import { Id, PositionedTree } from '../core/types';
import { calculateNodePositionOnPlot, filterPositionedNodesInTreeById } from '../mantle/positionedEntityHelpers';
import ClientCoords from './ClientCoords';
import { plotCoordsToClientCoords } from './coordConversions';
import { useState } from 'react';
import './LabelNodeEditor.scss';

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
  onBlur: (event: React.FocusEvent<HTMLInputElement>) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
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
  onBlur,
  onKeyDown,
}) => {
  const editedNodeData = filterPositionedNodesInTreeById([nodeId])(tree)[nodeId];
  const nodePositionOnPlot = plotCoordsToClientCoords(calculateNodePositionOnPlot(tree)(editedNodeData));
  const [inputValue, setInputValue] = useState<string>(editedNodeData.label);

  return <LabelNodeEditorInput
    key={`editable-node-${nodeId}`}
    value={inputValue}
    baseCoords={nodePositionOnPlot}
    onInput={setInputValue}
    onBlur={onBlur}
    onKeyDown={onKeyDown}
  />;
};

export default LabelNodeEditor;
