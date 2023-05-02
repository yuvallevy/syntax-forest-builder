import { useRef } from 'react';
import { StringSlice, PositionedTree, Sentence, Id } from '../core/types';
import './SentenceView.scss';

// A tree with no sentence will take up this width instead of 0 (or something close to 0):
const EMPTY_SENTENCE_WIDTH = 120;

// This will be added to the width of an input field determined by its content width, in case the width calculation is
// inaccurate for whatever reason
// (it doesn't allow placing one tree exactly at the end of another one, but that's not a common occurrence)
const EXTRA_SENTENCE_WIDTH = 4;

interface SentenceViewProps {
  tree: PositionedTree;
  treeId: Id;
  onChange: (newSentence: Sentence, oldSelectedSlice: StringSlice) => void;
  onSelect: (slice: StringSlice) => void;
  onKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void;
}

const getSelectionSlice = (element: HTMLInputElement): StringSlice | null =>
  element.selectionStart !== null && element.selectionEnd !== null
    ? [element.selectionStart, element.selectionEnd]
    : null;

const SentenceView: React.FC<SentenceViewProps> = ({ tree, treeId, onChange, onSelect, onKeyDown }) => {
  // Keep track of the previous selection so we can report it whenever a change is made
  // (the input event only carries information about the *new* selection, hence this hack)
  const oldSelection = useRef<StringSlice | null>(null);

  return <input
    type="text"
    id={treeId}
    value={tree.sentence}
    className="SentenceView-input"
    style={{
      left: tree.position.plotX,
      top: tree.position.plotY,
      width: tree.sentence.length === 0 ? EMPTY_SENTENCE_WIDTH : tree.width + EXTRA_SENTENCE_WIDTH,
    }}
    placeholder="Type a sentence..."
    onInput={e => onChange(e.currentTarget.value,
      oldSelection.current || [e.currentTarget.value.length, e.currentTarget.value.length])}
    onSelect={e => {
      const slice = getSelectionSlice(e.currentTarget);
      if (slice) onSelect(slice);
      oldSelection.current = getSelectionSlice(e.currentTarget);
    }}
    onKeyDown={onKeyDown}
  />;
};

export default SentenceView;
