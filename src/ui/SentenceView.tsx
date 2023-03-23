import { NodeSlice, PositionedTree, Sentence } from '../core/types';
import './SentenceView.scss';

interface SentenceViewProps {
  tree: PositionedTree;
  onChange: (newSentence: Sentence) => void;
  onSelect: (slice: NodeSlice) => void;
}

const SentenceView: React.FC<SentenceViewProps> = ({ tree, onChange, onSelect }) =>
  <input
    type="text"
    value={tree.sentence}
    className="SentenceView-input"
    style={{
      left: tree.position.plotX,
      top: tree.position.plotY,
      width: tree.width,
    }}
    onInput={e => onChange(e.currentTarget.value)}
    onSelect={e =>
      e.currentTarget.selectionStart !== null &&
      e.currentTarget.selectionEnd !== null &&
      onSelect([e.currentTarget.selectionStart, e.currentTarget.selectionEnd])}
  />;

export default SentenceView;
