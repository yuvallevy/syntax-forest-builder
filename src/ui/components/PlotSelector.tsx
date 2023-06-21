import { ActionIcon, Menu, Paper, Tabs, Tooltip } from '@mantine/core';
import { IconDotsVertical, IconFile, IconFilePlus, IconTrash, IconTree, IconTrees } from '@tabler/icons-react';
import { UnpositionedPlot } from '../../content/unpositioned/types';
import { isEmpty } from '../../util/objTransforms';
import { PlotIndex } from '../../content/types';
import './PlotSelector.scss';

interface PlotSelectorProps {
  plots: UnpositionedPlot[];
  activePlotIndex: PlotIndex;
  onPlotSelect: (newIndex: PlotIndex) => void;
  onPlotAdd: () => void;
  onPlotDelete: (plotIndex: PlotIndex) => void;
}

const PlotSelector: React.FC<PlotSelectorProps> = ({ plots, activePlotIndex, onPlotSelect, onPlotAdd, onPlotDelete }) => {
  return <Paper sx={{ position: 'fixed', left: 0, right: 0, bottom: 0 }}>
    <Tabs value={activePlotIndex.toString()} onTabChange={newValue => onPlotSelect(Number(newValue))} inverted>
      <Tabs.List>
        {plots.map((plot, index) => {
          const IconComponent =
            isEmpty(plot.trees) ? IconFile : Object.keys(plot.trees).length === 1 ? IconTree : IconTrees;
          return <div className="PlotSelector--tab-container">
            <Tabs.Tab
              key={index}
              value={index.toString()}
              icon={<IconComponent size="0.8rem" />}
              className={index === activePlotIndex ? 'PlotSelector--tab-button--selected' : ''}
            >
              Plot {index + 1}
            </Tabs.Tab>
            {index === activePlotIndex && <Menu shadow="md" withArrow>
              <Menu.Target>
                <ActionIcon size="sm" className="PlotSelector--tab-right-button">
                  <IconDotsVertical size={14} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Item color="red" icon={<IconTrash size={14} />} onClick={() => onPlotDelete(index)}>
                  Delete this plot
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>}
          </div>;
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
};

export default PlotSelector;
