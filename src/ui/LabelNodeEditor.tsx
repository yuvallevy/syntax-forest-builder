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
  onDone: (newLabel: string) => void;
  onCancel: () => void;
}

interface LabelNodeEditorProps {
  tree: PositionedTree;
  nodeId: Id;
  onDone: (newLabel: string) => void;
  onCancel: () => void;
}

const LabelNodeEditorInput: React.FC<LabelNodeEditorInputProps> = ({
  value,
  baseCoords,
  onInput,
  onDone,
  onCancel,
}) => <input
  type="text"
  className="LabelNodeEditorInput"
  value={value}
  autoFocus
  style={{ left: baseCoords.clientX, top: baseCoords.clientY }}
  onInput={e => onInput(e.currentTarget.value)}
  onBlur={e => onDone(e.currentTarget.value)}
  onKeyDown={e => {if (e.code === 'Escape') { e.preventDefault(); onCancel(); }}}
/>;

const LabelNodeEditor: React.FC<LabelNodeEditorProps> = ({
  tree,
  nodeId,
  onDone,
  onCancel,
}) => {
  const editedNodeData = filterPositionedNodesInTreeById([nodeId])(tree)[nodeId];
  const nodePositionOnPlot = plotCoordsToClientCoords(calculateNodePositionOnPlot(tree)(editedNodeData));
  const [inputValue, setInputValue] = useState<string>(editedNodeData.label);

  return <LabelNodeEditorInput
    key={`editable-node-${nodeId}`}
    value={inputValue}
    baseCoords={nodePositionOnPlot}
    onInput={setInputValue}
    onDone={onDone}
    onCancel={onCancel}
  />;
};

export default LabelNodeEditor;
