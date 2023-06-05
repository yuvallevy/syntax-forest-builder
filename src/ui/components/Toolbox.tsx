import { ActionIcon, Paper, SimpleGrid, useMantineTheme } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import './Toolbox.scss';
import substituteOsAwareHotkey from './substituteOsAwareHotkey';
import { useOs } from '@mantine/hooks';

export type ToolboxItem = {
  title: string;
  icon?: (props: TablerIconsProps) => JSX.Element;
  action: (event: React.UIEvent, focusEvent?: React.FocusEvent) => void;
  disabled?: boolean;
  toggleState?: 'on' | 'off' | 'indeterminate';
  hotkey?: string;
  description: string;
};

interface ToolboxProps {
  items: ToolboxItem[];
}

const Toolbox: React.FC<ToolboxProps> = ({ items }) => {
  const os = useOs();

  const [hoveredItem, setHoveredItem] = useState<ToolboxItem>();

  const lastFocusEvent = useRef<React.FocusEvent>();

  const theme = useMantineTheme();

  return <div className="Toolbox-container">
    <Paper
      shadow="sm"
      p="xs"
      className="Toolbox-body"
    >
      <div className="Toolbox-title">Tools</div>
      <SimpleGrid cols={2} spacing={2} verticalSpacing={2}>
        {items.map(item =>
          <div
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(undefined)}
          >
            <ActionIcon
              size="lg"
              variant={item.toggleState === 'on' ? 'gradient' : item.toggleState === 'indeterminate' ? 'light' : 'subtle'}
              disabled={item.disabled}
              color={theme.primaryColor}
              sx={{ ':disabled': { backgroundColor: theme.white, borderColor: theme.white } }}
              onFocus={e => { lastFocusEvent.current = e; }}
              onClick={clickEvent => item.action(clickEvent, lastFocusEvent.current)}
            >
              {item.icon
                ? <item.icon stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }}/>
                : item.title.slice(0, 2)}
            </ActionIcon>
          </div>
        )}
      </SimpleGrid>
    </Paper>
    {hoveredItem && <Paper
      shadow="sm"
      p="sm"
      className="Toolbox-tool-info"
    >
      <div className="Toolbox-tool-title">
        {hoveredItem.title}
        {hoveredItem.hotkey && ` (${substituteOsAwareHotkey(hoveredItem.hotkey, os)})`}
      </div>
      <div>{hoveredItem.description}</div>
    </Paper>}
  </div>;
};

export default Toolbox;
