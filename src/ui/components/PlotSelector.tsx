import { Paper, Tabs, Tooltip } from '@mantine/core';
import { IconFile, IconFilePlus } from '@tabler/icons-react';

const PlotSelector: React.FC = () =>
  <Paper sx={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
    <Tabs defaultValue="plot" inverted>
      <Tabs.List>
        <Tabs.Tab value="plot" icon={<IconFile size="0.8rem" />}>Plot 1</Tabs.Tab>
        <Tooltip label="New plot (coming soon)">
          <Tabs.Tab disabled value="newPlot" icon={<IconFilePlus size="0.8rem" />} title="New plot (coming soon)"></Tabs.Tab>
        </Tooltip>
      </Tabs.List>
    </Tabs>
  </Paper>;

export default PlotSelector;
