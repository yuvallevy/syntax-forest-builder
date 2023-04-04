import { useRef } from 'react';
import { NodeSlice, PositionedTree, Sentence } from '../core/types';
import './SentenceView.scss';

interface SentenceViewProps {
  tree: PositionedTree;
  onChange: (newSentence: Sentence, oldSelectedSlice: NodeSlice) => void;
  onSelect: (slice: NodeSlice) => void;
}

const getSelectionSlice = (element: HTMLInputElement): NodeSlice | null =>
  element.selectionStart !== null && element.selectionEnd !== null
    ? [element.selectionStart, element.selectionEnd]
    : null;

const SentenceView: React.FC<SentenceViewProps> = ({ tree, onChange, onSelect }) => {
  // Keep track of the previous selection so we can report it whenever a change is made
  // (the input event only carries information about the *new* selection, hence this hack)
  const oldSelection = useRef<NodeSlice | null>(null);

  return <input
    type="text"
    value={tree.sentence}
    className="SentenceView-input"
    style={{
      left: tree.position.plotX,
      top: tree.position.plotY,
      width: tree.width,
    }}
    onInput={e => onChange(e.currentTarget.value,
      oldSelection.current || [e.currentTarget.value.length, e.currentTarget.value.length])}
    onSelect={e => {
      const slice = getSelectionSlice(e.currentTarget);
      if (slice) onSelect(slice);
      oldSelection.current = getSelectionSlice(e.currentTarget);
    }}
  />;
};

export default SentenceView;
