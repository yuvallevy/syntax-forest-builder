import { useState } from 'react';
import { Flex, MantineProvider } from '@mantine/core';
import theme from './theme';
import './App.scss';
import { Id } from './types';
import {
  AddNodeBySelection, ChildNodeSide, DeleteSelectedNodes, generateNodeId, NodeSelectionInPlot, Redo, SelectChildNode,
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

const UiRoot = () => {
  const { state, dispatch } = useUiState();
  const { selection, activePlotIndex } = state;

  const [beginnersGuideActive, setBeginnersGuideActive] = useState<boolean>(false);

  const selectedNodeIndicators = selection instanceof NodeSelectionInPlot ? selection.nodeIndicatorsAsArray : [];

  const activePlot = state.contentState.current.plots[activePlotIndex];

  const selectParentNodes = () => dispatch(new SelectParentNodes());
  const selectLeftChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Left));
  const selectRightChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Right));
  const selectCenterChildNode = () => dispatch(new SelectChildNode(ChildNodeSide.Center));
  const startEditing = () => dispatch(new StartEditing());
  const addNode = () => dispatch(new AddNodeBySelection(generateNodeId()));
  const deleteNode = () => dispatch(new DeleteSelectedNodes());
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

  useHotkeys(['Backspace', 'Delete'], deleteNode);

  useHotkeys(['Control+z', 'Meta+z'], event => { event.preventDefault(); undo(); });

  useHotkeys(['Control+y', 'Meta+y'], event => { event.preventDefault(); redo(); });

  useHotkeys(Array.from('abcdefghijklmnopqrstuvwxyz', letter => `Shift+${letter}`), () => {
    if (state.selection instanceof NodeSelectionInPlot && state.selection.nodeIndicatorsAsArray.length === 1) {
      startEditing();  // For some reason the key press passes right through to the newly-created input.
                       // This seems unreliable. TODO: test cross-browser and on different computers
    }
  });

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView />
    <Toolbox />
    <Flex justify="flex-end" sx={{ position: 'fixed', right: '0.75rem', top: '0.75rem' }}>
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
  </MantineProvider>;
}

export default UiRoot;
