import { useState } from 'react';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import './App.scss';
import { Id, StringSlice } from './content/types';
import PlotView from './ui/components/PlotView';
import { generateNodeId } from './ui/content/generateId';
import { isNodeSelection } from './ui/selection';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { allTopLevelInPlot } from './content/unpositioned/plotManipulation';
import Toolbox from './ui/components/Toolbox';
import AboutButton from './ui/components/meta/AboutButton';
import PlotSelector from './ui/components/PlotSelector';
import BeginnersGuide from './ui/components/meta/BeginnersGuide';
import PlotPlaceholder from './ui/components/meta/PlotPlaceholder';
import { isEmpty } from './util/objTransforms';
import { isBranching, isTerminal } from './content/unpositioned/types';
import useUiState from './ui/useUiState';

const App = () => {
  const { state, dispatch } = useUiState();
  const { selection, activePlotIndex } = state;

  const [beginnersGuideActive, setBeginnersGuideActive] = useState<boolean>(false);

  const selectedNodeIndicators = isNodeSelection(selection) ? selection.nodeIndicators : [];

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
  const selectSliceAtDomLevel = (treeId: Id, [start, end]: StringSlice) => {
    const element: HTMLInputElement | null = document.querySelector('input#' + treeId);
    if (!element) return;
    element.setSelectionRange(start, end);
    setTimeout(() => element.focus(), 5);
  };

  useHotkeys(['ArrowUp'], () => {
    if (selectedNodeIndicators.length > 0 && allTopLevelInPlot(selectedNodeIndicators)(activePlot)) {
      addNode();
    } else {
      selectParentNodes();
    }
  });

  useHotkeys(['ArrowLeft'], selectLeftChildNode);

  useHotkeys(['ArrowRight'], selectRightChildNode);

  useHotkeys(['ArrowDown'], () => {
    if (selectedNodeIndicators.length !== 1) return;
    const selectedNodeObject = activePlot.trees[selectedNodeIndicators[0].treeId].nodes[selectedNodeIndicators[0].nodeId];
    if (isBranching(selectedNodeObject)) {
      selectCenterChildNode();
    } else if (isTerminal(selectedNodeObject)) {
      selectSliceAtDomLevel(selectedNodeIndicators[0].treeId, selectedNodeObject.slice);
    }
  });

  useHotkeys(['Enter', 'F2'], startEditing);

  useHotkeys(['Backspace', 'Delete'], deleteNode);

  useHotkeys(['Control+z', 'Meta+z'], event => { event.preventDefault(); undo(); });

  useHotkeys(['Control+y', 'Meta+y'], event => { event.preventDefault(); redo(); });

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView />
    <Toolbox />
    <AboutButton />
    <PlotSelector />
    {beginnersGuideActive ? <BeginnersGuide
      onComplete={() => setBeginnersGuideActive(false)}
    /> : isEmpty(activePlot.trees) && <PlotPlaceholder
      onDemoRequest={() => setBeginnersGuideActive(true)}
    />}
  </MantineProvider>;
}

export default App;
