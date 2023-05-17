import { ActionIcon, Paper, SimpleGrid, Tooltip, useMantineTheme } from '@mantine/core';
import { TablerIconsProps } from '@tabler/icons-react';

export type ToolboxItem = {
  title: string;
  icon?: (props: TablerIconsProps) => JSX.Element;
  action: () => void;
  disabled?: boolean;
  toggleState?: 'on' | 'off' | 'indeterminate';
};

interface ToolboxProps {
  items: ToolboxItem[];
}

const Toolbox: React.FC<ToolboxProps> = ({ items }) => {
  const theme = useMantineTheme();

  return <Paper
    shadow="sm"
    p="xs"
    sx={{ position: 'fixed', left: '1rem', top: '1rem' }}
  >
    <SimpleGrid cols={2} spacing={2} verticalSpacing={2}>
      {items.map(item =>
        <Tooltip key={item.title} label={item.title} openDelay={400}>
          <ActionIcon
            size="lg"
            variant={item.toggleState === 'on' ? 'gradient' : item.toggleState === 'indeterminate' ? 'light' : 'subtle'}
            disabled={item.disabled}
            color={theme.primaryColor}
            sx={{ ':disabled': { backgroundColor: theme.white, borderColor: theme.white } }}
            onClick={item.action}
          >
            {item.icon
              ? <item.icon stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }}/>
              : item.title.slice(0, 2)}
          </ActionIcon>
        </Tooltip>
      )}
    </SimpleGrid>
  </Paper>;
};

export default Toolbox;