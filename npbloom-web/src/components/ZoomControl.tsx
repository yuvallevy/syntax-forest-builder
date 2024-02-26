import useUiState from '../useUiState.ts';
import { CoordsInClient, SetZoomLevel, Zoom } from 'npbloom-core';
import { Button, Menu } from '@mantine/core';
import './ZoomControl.scss';

const screenCenterCoords = (): CoordsInClient => new CoordsInClient(window.innerWidth / 2, window.innerHeight / 2);

const zoomLevelToString = (zoomLevel: number) =>
  zoomLevel.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0, style: 'percent' });

const ZoomControl: React.FC = () => {
  const { state, dispatch } = useUiState();

  const currentZoomLevelStr = zoomLevelToString(state.panZoomState.zoomLevel);

  return <div className="ZoomControl">
    <Menu shadow="md" position="top-end">
      <Menu.Target>
        <Button variant="white" color="gray" size="xs">
          Zoom: {currentZoomLevelStr}
        </Button>
      </Menu.Target>

      <Menu.Dropdown>
        {[0.5, 0.667, 0.75, 1, 1.25, 1.5, 2, 3, 4].map(zoomLevel => <Menu.Item
          key={zoomLevel}
          onClick={() => dispatch(new SetZoomLevel(zoomLevel, screenCenterCoords()))}
        >
          {zoomLevelToString(zoomLevel)}
        </Menu.Item>)}
        <Menu.Divider />
        <Menu.Item
          onClick={() => dispatch(new Zoom(1.25, screenCenterCoords()))}
        >
          Zoom In
        </Menu.Item>
        <Menu.Item
          onClick={() => dispatch(new Zoom(0.8, screenCenterCoords()))}
        >
          Zoom Out
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  </div>;
};

export default ZoomControl;
