import { Paper, Tabs, Tooltip } from '@mantine/core';
import { IconFile, IconFilePlus, IconTree, IconTrees } from '@tabler/icons-react';
import { UnpositionedPlot } from '../../content/unpositioned/types';
import { isEmpty } from '../../util/objTransforms';
import { PlotIndex } from '../../content/types';

interface PlotSelectorProps {
  plots: UnpositionedPlot[];
  activePlotIndex: PlotIndex;
  onPlotSelect: (newIndex: PlotIndex) => void;
  onPlotAdd: () => void;
}

const PlotSelector: React.FC<PlotSelectorProps> = ({ plots, activePlotIndex, onPlotSelect, onPlotAdd }) =>
  <Paper sx={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
    <Tabs value={activePlotIndex.toString()} onTabChange={newValue => onPlotSelect(Number(newValue))} inverted>
      <Tabs.List>
        {plots.map((plot, index) => {
          const IconComponent =
            isEmpty(plot.trees) ? IconFile : Object.keys(plot.trees).length === 1 ? IconTree : IconTrees;
          return <Tabs.Tab key={index} value={index.toString()} icon={<IconComponent size="0.8rem"/>}>
            Plot {index + 1}
          </Tabs.Tab>;
        })}
        <Tooltip label="New plot">
          <Tabs.Tab
            value="newPlot"
            onClick={onPlotAdd}
            icon={<IconFilePlus size="0.8rem" />}
          />
        </Tooltip>
      </Tabs.List>
    </Tabs>
  </Paper>;

export default PlotSelector;
