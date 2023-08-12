import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import './App.scss';
import { Id } from './types';
import {
  arrayFromSet, generateNodeId, NodeIndicatorInPlot, NodeSelectionInPlot, set, StringSlice, UnpositionedBranchingNode,
  UnpositionedTerminalNode
} from 'npbloom-core';
import PlotView from './ui/components/PlotView';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import Toolbox from './ui/components/Toolbox';
import AboutButton from './ui/components/meta/AboutButton';
import PlotSelector from './ui/components/PlotSelector';
import BeginnersGuide from './ui/components/meta/BeginnersGuide';
import PlotPlaceholder from './ui/components/meta/PlotPlaceholder';
import useUiState from './ui/useUiState';

const App = () => {
  const { state, dispatch } = useUiState();
  const { selection, activePlotIndex } = state;

  const [beginnersGuideActive, setBeginnersGuideActive] = useState<boolean>(false);

  const selectedNodeIndicators = selection instanceof NodeSelectionInPlot
    ? arrayFromSet<NodeIndicatorInPlot>(selection.nodeIndicators) : [];

  const activePlot = state.contentState.current.plots[activePlotIndex];

  const selectParentNodes = () => dispatch({ type: 'selectParentNodes' });
  const selectLeftChildNode = () => dispatch({ type: 'selectChildNode', side: 'left' });
  const selectRightChildNode = () => dispatch({ type: 'selectChildNode', side: 'right' });
  const selectCenterChildNode = () => dispatch({ type: 'selectChildNode', side: 'center' });
  const startEditing = () => dispatch({ type: 'startEditing' });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });
  const deleteNode = () => dispatch({ type: 'deleteSelectedNodes' });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  /** Filthy hack - select a slice at the DOM level to trigger the appropriate changes in both state and DOM */
  const selectSliceAtDomLevel = (treeId: Id, { start, endExclusive }: StringSlice) => {
    const element: HTMLInputElement | null = document.querySelector('input#' + treeId);
    if (!element) return;
    element.setSelectionRange(start, endExclusive);
    setTimeout(() => element.focus(), 5);
  };

  useHotkeys(['ArrowUp'], () => {
    if (selectedNodeIndicators.length > 0 && activePlot.allTopLevel(set(selectedNodeIndicators))) {
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
    if (state.selection instanceof NodeSelectionInPlot && arrayFromSet(state.selection.nodeIndicators).length === 1) {
      startEditing();  // For some reason the key press passes right through to the newly-created input.
                       // This seems unreliable. TODO: test cross-browser and on different computers
    }
  });

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView />
    <Toolbox />
    <AboutButton />
    <PlotSelector />
    {beginnersGuideActive ? <BeginnersGuide
      onComplete={() => setBeginnersGuideActive(false)}
    /> : activePlot.isEmpty && <PlotPlaceholder
      onDemoRequest={() => setBeginnersGuideActive(true)}
    />}
  </MantineProvider>;
}

export default App;
