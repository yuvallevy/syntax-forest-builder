import { useState } from 'react';
import { Button, Flex, MantineProvider, Menu, Space, Text } from '@mantine/core';
import { IconDeviceFloppy, IconFiles, IconFolder } from '@tabler/icons-react';
import theme from './theme';
import './App.scss';
import { Id } from './types';
import {
  AddNodeBySelection, ChildNodeSide, DeleteSelectedEntities, generateNodeId, NodeSelectionInPlot, Redo, SelectChildNode,
  SelectParentNodes, StartEditing, StringSlice, UnpositionedBranchingNode, UnpositionedTerminalNode, Undo
} from 'npbloom-core';
import PlotView from './components/PlotView';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import Settings from './components/meta/Settings';
import Toolbox from './components/Toolbox';
import AboutButton from './components/meta/AboutButton';
import PlotSelector from './components/PlotSelector';
import BeginnersGuide from './components/meta/BeginnersGuide';
import PlotPlaceholder from './components/meta/PlotPlaceholder';
import useUiState from './useUiState';
import useFileIo from './fileIo/useFileIo';
import { useOs } from '@mantine/hooks';
import substituteOsAwareHotkey from './components/substituteOsAwareHotkey';

const UiRoot = () => {
  const { state, dispatch } = useUiState();
  const { selection, activePlotIndex } = state;

  const os = useOs();

  const [beginnersGuideActive, setBeginnersGuideActive] = useState<boolean>(false);
  const { fileIoModalComponent, activeFileName, openFileSaveModal, openFileLoadModal, saveOrSaveAs } = useFileIo();

  const selectedNodeIndicators = selection instanceof NodeSelectionInPlot ? selection.nodeIndicatorsAsArray : [];

  const activePlot = state.contentState.current.plots[activePlotIndex];

  const selectParentNodes = () => dispatch(new SelectParentNodes());
  const selectLeftChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Left));
  const selectRightChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Right));
  const selectCenterChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Center));
  const startEditing = () => dispatch(new StartEditing());
  const addNode = () => dispatch(new AddNodeBySelection(generateNodeId()));
  const deleteEntities = () => dispatch(new DeleteSelectedEntities());
  const undo = () => dispatch(new Undo());
  const redo = () => dispatch(new Redo());

  /** Filthy hack - select a slice at the DOM level to trigger the appropriate changes in both state and DOM */
  const selectSliceAtDomLevel = (treeId: Id, { start, endExclusive }: StringSlice) => {
    const element: HTMLInputElement | null = document.querySelector('input#' + treeId);
    if (!element) return;
    element.setSelectionRange(start, endExclusive);
    setTimeout(() => element.focus(), 5);
  };

  useHotkeys(['ArrowUp'], () => {
    if (selectedNodeIndicators.length > 0 && activePlot.allTopLevel(selectedNodeIndicators)) {
      addNode();
    } else {
      selectParentNodes();
    }
  });

  useHotkeys(['ArrowLeft'], selectLeftChildNode);

  useHotkeys(['ArrowRight'], selectRightChildNode);

  useHotkeys(['ArrowDown'], () => {
    if (selectedNodeIndicators.length !== 1) return;
    const selectedNodeObject = activePlot.tree(selectedNodeIndicators[0].treeId).node(selectedNodeIndicators[0].nodeId);
    if (selectedNodeObject instanceof UnpositionedBranchingNode) {
      selectCenterChildNode();
    } else if (selectedNodeObject instanceof UnpositionedTerminalNode) {
      selectSliceAtDomLevel(selectedNodeIndicators[0].treeId, selectedNodeObject.slice);
    }
  });

  useHotkeys(['Enter', 'F2'], startEditing);

  useHotkeys(['Backspace', 'Delete'], deleteEntities);

  useHotkeys(['Control+z', 'Meta+z'], event => { event.preventDefault(); undo(); },
    { ignoredElementWhitelist: ['INPUT'] });

  useHotkeys(['Control+y', 'Meta+y'], event => { event.preventDefault(); redo(); },
    { ignoredElementWhitelist: ['INPUT'] });

  useHotkeys(['Control+o', 'Meta+o'], event => { event.preventDefault(); openFileLoadModal(); },
    { ignoredElementWhitelist: ['INPUT'] });

  useHotkeys(['Control+s', 'Meta+s'], event => { event.preventDefault(); saveOrSaveAs(); },
    { ignoredElementWhitelist: ['INPUT'] });

  useHotkeys(Array.from('abcdefghijklmnopqrstuvwxyz', letter => `Shift+${letter}`), () => {
    if (state.selection instanceof NodeSelectionInPlot && state.selection.nodeIndicatorsAsArray.length === 1) {
      startEditing();  // For some reason the key press passes right through to the newly-created input.
                       // This seems unreliable. TODO: test cross-browser and on different computers
    }
  });

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView />
    <Toolbox />
    <Flex align="center" sx={{ position: 'fixed', left: '0.75rem', right: '0.75rem', top: '0.75rem' }}>
      <Menu shadow="md" withArrow position="top-start" transitionProps={{ transition: 'scale-y' }} width={'18ch'}>
        <Menu.Target>
          <Button variant="subtle" size="xs">
            <IconFiles stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }} />&nbsp; File
          </Button>
        </Menu.Target>
        <Menu.Dropdown>
          <Menu.Item
            icon={<IconFolder size={14} />}
            rightSection={<Text color="dimmed">{substituteOsAwareHotkey('Ctrl-O', os)}</Text>}
            onClick={openFileLoadModal}
          >
            Open...
          </Menu.Item>
          <Menu.Item
            icon={<IconDeviceFloppy size={14} />}
            rightSection={<Text color="dimmed">{substituteOsAwareHotkey('Ctrl-S', os)}</Text>}
            onClick={saveOrSaveAs}
          >
            Save{activeFileName ? '' : '...'}
          </Menu.Item>
          <Menu.Item disabled={!activeFileName} onClick={openFileSaveModal}>
            Save As...
          </Menu.Item>
          {activeFileName && <><Menu.Divider />
          <Menu.Item disabled>
            Currently open file:<br />{activeFileName}
          </Menu.Item></>}
        </Menu.Dropdown>
      </Menu>
      <Space style={{ flexGrow: 1 }} />
      <Settings />
      <AboutButton />
    </Flex>
    <PlotSelector />
    {beginnersGuideActive ? <BeginnersGuide
      onComplete={() => setBeginnersGuideActive(false)}
    /> : activePlot.isEmpty && <PlotPlaceholder
      showWelcome={!state.contentState.canUndo && !state.contentState.canRedo}
      onDemoRequest={() => setBeginnersGuideActive(true)}
    />}
    {fileIoModalComponent}
  </MantineProvider>;
}

export default UiRoot;
