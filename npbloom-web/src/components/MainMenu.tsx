import { Fragment } from 'react';
import { Button, Flex, Header, Menu, Space, Text } from '@mantine/core';
import { useOs } from '@mantine/hooks';
import { IconDeviceFloppy, IconFolder, TablerIconsProps } from '@tabler/icons-react';
import { MAIN_MENU_HEIGHT } from '../uiDimensions.ts';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { MarkCCommandedNodes, MarkCCommandingNodes, NodeSelectionInPlot, RemoveRelationMarkingsInSelectedTree,
  RemoveAllRelationMarkings } from 'npbloom-core';
import useUiState from '../useUiState.ts';
import substituteOsAwareHotkey from './substituteOsAwareHotkey.ts';
import Settings from './meta/Settings';
import AboutButton from './meta/AboutButton';
import useFileIo from '../io/useFileIo';

type MenuItem = {
  label: string;
  action?: (() => void) | (() => Promise<void>);
  icon?: (props: TablerIconsProps) => JSX.Element;
  hotkey?: string;
  disabled?: boolean;
  hidden?: boolean;
};

type MenuItemGroup = MenuItem[];

type MenuSection = MenuItemGroup[];

type NamedMenuSection = [string, MenuSection];

const MainMenu: React.FC = () => {
  const { state, dispatch } = useUiState();

  const { fileIoModalComponent, activeFileName, openFileSaveModal, openFileLoadModal, saveOrSaveAs } = useFileIo();

  const os = useOs();

  const oneNodeSelected = state.selection instanceof NodeSelectionInPlot &&
    state.selection.nodeIndicatorsAsArray.length === 1;

  const markCCommandingNodes = () => {
    if (oneNodeSelected) dispatch(new MarkCCommandingNodes());
  }

  const markCCommandedNodes = () => {
    if (oneNodeSelected) dispatch(new MarkCCommandedNodes());
  }

  useHotkeys(['Control+o', 'Meta+o'], event => { event.preventDefault(); openFileLoadModal(); },
    { ignoredElementWhitelist: ['INPUT'] });

  useHotkeys(['Control+s', 'Meta+s'], event => { event.preventDefault(); saveOrSaveAs(); },
    { ignoredElementWhitelist: ['INPUT'] });

  const mainMenuElements: NamedMenuSection[] = [
    ['File', [
      [
        { label: 'Open...', icon: IconFolder, hotkey: 'Ctrl-O', action: openFileLoadModal },
        { label: activeFileName ? 'Save' : 'Save...', icon: IconDeviceFloppy, hotkey: 'Ctrl-S', action: saveOrSaveAs },
        { label: 'Save As...', disabled: !activeFileName, action: openFileSaveModal },
      ],
      [
        { label: activeFileName ? `Currently open file:\n${activeFileName}` : '', disabled: true, hidden: !activeFileName },
      ],
    ]],
    ['Mark', [
      [
        { label: 'C-commanding nodes', disabled: !oneNodeSelected, action: markCCommandingNodes },
        { label: 'C-commanded nodes', disabled: !oneNodeSelected, action: markCCommandedNodes },
      ],
      [
        { label: 'Clear relation markings in selected tree',
          action: () => dispatch(new RemoveRelationMarkingsInSelectedTree()) },
        { label: 'Clear all relation markings',
          action: () => dispatch(new RemoveAllRelationMarkings()) },
      ]
    ]],
  ]

  return <>
    <Header height={MAIN_MENU_HEIGHT}>
      <Flex align="stretch" className="MainMenu">
        {mainMenuElements.map(([sectionName, sectionGroups]) => (
          <Menu
            key={sectionName}
            shadow="md"
            offset={0}
            position="top-start"
            transitionProps={{ transition: 'scale-y' }}
          >
            <Menu.Target>
              <Button variant="subtle" size="sm">
                {sectionName}
              </Button>
            </Menu.Target>
            <Menu.Dropdown sx={{ minWidth: '18ch' }}>
              {sectionGroups.map((groupItems, groupIndex) => <Fragment key={groupIndex}>
                {groupItems.map((item, itemIndex) =>
                  item.hidden ? null : <Menu.Item
                    key={itemIndex}
                    icon={item.icon ? <item.icon size={14} /> : null}
                    rightSection={item.hotkey && <Text color="dimmed">{substituteOsAwareHotkey(item.hotkey, os)}</Text>}
                    style={{ whiteSpace: 'pre-line' }}
                    disabled={item.disabled}
                    onClick={item.action}
                  >
                    {item.label}
                  </Menu.Item>)}
                {groupIndex < sectionGroups.length - 1
                  && sectionGroups[groupIndex + 1].some(({ hidden }) => !hidden)
                  && <Menu.Divider />}
              </Fragment>)}
            </Menu.Dropdown>
          </Menu>
        ))}
        <Space style={{ flexGrow: 1 }} />
        <Settings />
        <AboutButton />
      </Flex>
    </Header>
    {fileIoModalComponent}
  </>;
};

export default MainMenu;
