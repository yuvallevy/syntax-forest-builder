import { Alert, Anchor } from '@mantine/core';
import './PlotPlaceholder.scss';
import LogoDim from './npbloom-logo-dim.svg';

interface PlotPlaceholderProps {
  showWelcome: boolean;
  acceptMouseEvents: boolean;
  onDemoRequest: () => void;
}

const PlotPlaceholder: React.FC<PlotPlaceholderProps> = ({ showWelcome, acceptMouseEvents, onDemoRequest }) =>
  <div className="PlotPlaceholder--container">
    {showWelcome ? <Alert
      className="PlotPlaceholder--alert"
      color="gray"
      title="Welcome to NPBloom!"
      style={{ pointerEvents: acceptMouseEvents ? 'auto' : 'none' }}
    >
      To start, click anywhere and type a sentence,
      or <Anchor onClick={onDemoRequest}>watch a demo</Anchor> first.
    </Alert> : <img src={LogoDim} height={120} alt="NPBloom logo" />}
  </div>;

export default PlotPlaceholder;
