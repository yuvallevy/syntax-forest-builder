import { PositionedTree, Sentence } from '../core/types';
import './SentenceView.scss';

interface SentenceViewProps {
  tree: PositionedTree;
  onChange: (newSentence: Sentence) => void;
}

const SentenceView: React.FC<SentenceViewProps> = ({ tree, onChange }) =>
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
  />;

export default SentenceView;
