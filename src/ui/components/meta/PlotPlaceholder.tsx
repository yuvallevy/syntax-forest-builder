import { Alert, Anchor } from '@mantine/core';
import './PlotPlaceholder.scss';

interface PlotPlaceholderProps {
  onDemoRequest: () => void;
}

const PlotPlaceholder: React.FC<PlotPlaceholderProps> = ({ onDemoRequest }) =>
  <div className="PlotPlaceholder--container">
    <Alert className="PlotPlaceholder--alert" color="gray" title="Welcome to NPBloom!">
      To start, click anywhere and type a sentence,
      or <Anchor onClick={onDemoRequest}>try the demo</Anchor> first.
    </Alert>
  </div>;

export default PlotPlaceholder;
