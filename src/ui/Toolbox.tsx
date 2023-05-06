import { ActionIcon, Paper, SimpleGrid } from '@mantine/core';

export type ToolboxItem = {
  title: string;
  icon?: React.ReactNode;
  action: () => void;
  disabled?: boolean;
  toggleState?: 'on' | 'off' | 'indeterminate';
};

interface ToolboxProps {
  items: ToolboxItem[];
}

const Toolbox: React.FC<ToolboxProps> = ({ items }) =>
  <Paper
    shadow="sm"
    p="xs"
    sx={{ position: 'fixed', left: '1rem', top: '1rem' }}
  >
    <SimpleGrid cols={2} spacing={0} verticalSpacing={0}>
      {items.map(item =>
        <ActionIcon
          key={item.title}
          size="lg"
          variant={item.toggleState === 'on' ? 'filled' : item.toggleState === 'indeterminate' ? 'light' : 'subtle'}
          disabled={item.disabled}
          onClick={item.action}
        >
          {item.title.slice(0, 2)}
        </ActionIcon>
      )}
    </SimpleGrid>
  </Paper>;

export default Toolbox;
