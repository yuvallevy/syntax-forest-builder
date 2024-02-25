import useUiState from '../useUiState.ts';
import { CoordsInClient, Zoom } from 'npbloom-core';
import { Button, Menu } from '@mantine/core';
import './ZoomControl.scss';

const screenCenterCoords = (): CoordsInClient => new CoordsInClient(window.innerWidth / 2, window.innerHeight / 2);

const ZoomControl: React.FC = () => {
  const { state, dispatch } = useUiState();

  const currentZoomLevelStr = state.panZoomState.zoomLevel.toLocaleString(undefined,
    { minimumFractionDigits: 0, maximumFractionDigits: 0, style: 'percent' });

  return <div className="ZoomControl">
    <Menu shadow="md" withArrow position="top-start">
      <Menu.Target>
        <Button variant="white" size="xs">
          Zoom: {currentZoomLevelStr}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        <Menu.Item onClick={() => dispatch(new Zoom(1.25, screenCenterCoords()))}>
          Zoom In
        </Menu.Item>
        <Menu.Item onClick={() => dispatch(new Zoom(1 / 1.25, screenCenterCoords()))}>
          Zoom Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  </div>;
};

export default ZoomControl;
