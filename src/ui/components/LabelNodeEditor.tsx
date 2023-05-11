import { Id } from '../../content/types';
import { filterPositionedNodesInTreeById } from '../../content/positioned/positionedEntityHelpers';
import ClientCoords from '../ClientCoords';
import { calculateNodeCenterOnPlot, plotCoordsToClientCoords } from '../coords';
import { useState } from 'react';
import './LabelNodeEditor.scss';
import { PositionedTree } from '../../content/positioned/types';

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
// }) => <TextInput
//   className="LabelNodeEditorInput"
//   value={value}
//   autoFocus
//   size="xs"
//   sx={{ left: baseCoords.clientX, top: baseCoords.clientY }}
//   onInput={e => onInput(e.currentTarget.value)}
//   // onBlur={onBlur}
//   onKeyDown={onKeyDown}
// />;
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
  const nodePositionOnPlot = plotCoordsToClientCoords(calculateNodeCenterOnPlot(tree)(editedNodeData));
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
