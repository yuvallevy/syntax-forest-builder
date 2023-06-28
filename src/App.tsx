import { useMemo, useState } from 'react';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import './App.scss';
import { applyNodePositionsToPlot } from './content/positioned/positioning';
import { Id, NodeIndicatorInPlot, NodeLabel, PlotIndex, Sentence, StringSlice } from './content/types';
import PlotView from './ui/components/PlotView';
import strWidth from './ui/strWidth';
import { generateNodeId, generateTreeId } from './ui/content/generateId';
import { applySelection, isNodeSelection, isSliceSelection, NodeSelectionMode, SelectionInPlot } from './ui/selection';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { allTopLevelInPlot } from './content/unpositioned/plotManipulation';
import { getNodeIdsAssignedToSlice } from './content/unpositioned/manipulation';
import { canRedo, canUndo } from './ui/uiState';
import Toolbox, { ToolboxItem } from './ui/components/Toolbox';
import { NodeCreationTrigger } from './ui/nodeCreationTriggers';
import {
  IconArrowBackUp, IconArrowForwardUp, IconPencil, IconPlus, IconTrash, IconTriangle
} from '@tabler/icons-react';
import AboutButton from './ui/components/meta/AboutButton';
import PlotSelector from './ui/components/PlotSelector';
import BeginnersGuide from './ui/components/meta/BeginnersGuide';
import PlotPlaceholder from './ui/components/meta/PlotPlaceholder';
import { isEmpty } from './util/objTransforms';
import { PositionedPlot } from './content/positioned/types';
import {
  isBranching, isTerminal, PlotCoordsOffset, UnpositionedPlot, UnpositionedTerminalNode
} from './content/unpositioned/types';
import { IconAdoptNode, IconDisownNode, IconResetNodePosition } from './ui/components/icons';
import useUiState from './ui/useUiState';

const App = () => {
  const { state, dispatch } = useUiState();
  const { selection, activePlotIndex, editedNodeIndicator, selectionAction } = state;

  const [beginnersGuideActive, setBeginnersGuideActive] = useState<boolean>(false);

  const nothingSelected = isNodeSelection(selection) && selection.nodeIndicators.length === 0;
  const noNodesSelected = !isNodeSelection(selection) || selection.nodeIndicators.length === 0;
  const selectedNodeIndicators = isNodeSelection(selection) ? selection.nodeIndicators : [];

  const activePlot: UnpositionedPlot =
    useMemo(() => state.contentState.current.plots[activePlotIndex], [state.contentState, activePlotIndex]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const selectedNodeObjects = selectedNodeIndicators.map(({ treeId, nodeId }) => activePlot.trees[treeId].nodes[nodeId]);

  const setActivePlotIndex = (newPlotIndex: PlotIndex) => dispatch({ type: 'setActivePlotIndex', newPlotIndex });
  const addPlot = () => dispatch({ type: 'addPlot' });
  const deletePlot = (plotIndex: PlotIndex) => dispatch({ type: 'deletePlot', plotIndex });
  const setSelection = (newSelection: SelectionInPlot) => dispatch({ type: 'setSelection', newSelection });
  const selectParentNodes = () => dispatch({ type: 'selectParentNodes' });
  const selectLeftChildNode = () => dispatch({ type: 'selectChildNode', side: 'left' });
  const selectRightChildNode = () => dispatch({ type: 'selectChildNode', side: 'right' });
  const selectCenterChildNode = () => dispatch({ type: 'selectChildNode', side: 'center' });
  const startEditing = () => dispatch({ type: 'startEditing' });
  const stopEditing = () => dispatch({ type: 'stopEditing' });
  const setEditedNodeLabel = (newLabel: NodeLabel) => dispatch({ type: 'setEditedNodeLabel', newLabel });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });
  const deleteNode = () => dispatch({ type: 'deleteSelectedNodes' });
  const moveNodes = (dx: number, dy: number) => dispatch({ type: 'moveSelectedNodes', dx, dy });
  const resetNodePositions = () => dispatch({ type: 'resetSelectedNodePositions' });
  const toggleTriangle = (wasEditing: boolean) => {
    dispatch({ type: 'toggleTriangle' });
    wasEditing && setTimeout(startEditing, 50);  // Hack to restore focus to edited node when clicking the triangle button.
  };
  const toggleAdoptMode = () =>
    dispatch({ type: 'setSelectionAction', selectionAction: selectionAction === 'adopt' ? 'select' : 'adopt' });
  const toggleDisownMode = () =>
    dispatch({ type: 'setSelectionAction', selectionAction: selectionAction === 'disown' ? 'select' : 'disown' });
  const adoptNodes = (adoptedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch({ type: 'adoptNodesBySelection', adoptedNodeIndicators });
  const disownNodes = (disownedNodeIndicators: NodeIndicatorInPlot[]) =>
    dispatch({ type: 'disownNodesBySelection', disownedNodeIndicators });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  /** Filthy hack - select a slice at the DOM level to trigger the appropriate changes in both state and DOM */
  const selectSliceAtDomLevel = (treeId: Id, [start, end]: StringSlice) => {
    const element: HTMLInputElement | null = document.querySelector('input#' + treeId);
    if (!element) return;
    element.setSelectionRange(start, end);
    setTimeout(() => element.focus(), 5);
  };

  const addTreeAndFocus = (position: PlotCoordsOffset) => {
    const newTreeId = generateTreeId();
    dispatch({ type: 'addTree', newTreeId, offset: position });
    setTimeout(() => selectSliceAtDomLevel(newTreeId, [0, 0]), 50);
  };

  const removeAndDeselectTree = (treeId: Id) => {
    dispatch({ type: 'removeTree', treeId });
    setSelection({ nodeIndicators: [] });
  };

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (nothingSelected) {
      addTreeAndFocus({ dPlotX: event.clientX, dPlotY: event.clientY });
    } else {
      setSelection({ nodeIndicators: [] });
    }
  };

  const handleNodesSelect = (nodeIndicators: NodeIndicatorInPlot[], mode: NodeSelectionMode = 'set') =>
    selectionAction === 'adopt' ? adoptNodes(nodeIndicators)
      : selectionAction === 'disown' ? disownNodes(nodeIndicators)
      : setSelection({ nodeIndicators: applySelection(mode, nodeIndicators, selectedNodeIndicators) });
  const handleSliceSelect = (treeId: Id, slice: StringSlice) => setSelection({ treeId, slice });

  const handleNodeCreationTriggerClick = (treeId: Id, trigger: NodeCreationTrigger) => {
    dispatch({
      type: 'addNodeByTarget',
      treeId,
      newNodeId: generateNodeId(),
      ...(
        'childIds' in trigger
          ? { targetChildIds: trigger.childIds }
          : { targetSlice: trigger.slice, triangle: false }
      ),
    });
  };

  const handleSentenceBlur = (treeId: Id, event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.trim() === '' && isEmpty(activePlot.trees[treeId].nodes)) {
      removeAndDeselectTree(treeId);
    }
  };

  const handleSentenceChange = (_: Id, newSentence: Sentence, oldSelectedSlice: StringSlice) => dispatch({
    type: 'setSentence',
    newSentence,
    oldSelectedSlice,
  });

  const handleSentenceKeyDown = (treeId: Id, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.currentTarget.blur();
      if (isSliceSelection(selection) &&
        getNodeIdsAssignedToSlice(selection.slice)(activePlot.trees[selection.treeId]).length === 0) {
        addNode();
      } else {
        selectParentNodes();
      }
    } else if ((event.key === 'Backspace' || event.key === 'Delete') && event.currentTarget.value === '') {
      removeAndDeselectTree(treeId);
    } else if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      undo();
    } else if (event.key === 'y' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      redo();
    }
  };

  const handleNodeEditorBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setEditedNodeLabel(event.currentTarget.value);
    stopEditing();
  };

  const handleNodeEditorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editedNodeIndicator) return;
    if (event.key === 'ArrowUp') {
      setEditedNodeLabel(event.currentTarget.value);
      if (allTopLevelInPlot([editedNodeIndicator])(activePlot)) {
        addNode();
      } else {
        selectParentNodes();
      }
    } else if (event.key === 'Enter') {
      setEditedNodeLabel(event.currentTarget.value);
      stopEditing();
    } else if (event.key === 'Escape') {
      stopEditing();
    }
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

  const getTriangleButtonState = (): { toggleState: 'on' | 'off' | 'indeterminate'; disabled?: boolean } => {
    // No nodes selected, or some non-terminal nodes selected:
    if (selectedNodeIndicators.length === 0 || !(selectedNodeObjects.every(isTerminal)))
      return { disabled: true, toggleState: 'off' };

    // At this point we know that there are selected nodes and that they are all terminal
    const selectedTerminalNodes = selectedNodeObjects as UnpositionedTerminalNode[];
    // Only triangle nodes selected:
    if (selectedTerminalNodes.every(node => node.triangle)) return { toggleState: 'on' };
    // Some triangle nodes and some non-triangle nodes selected:
    if (selectedTerminalNodes.some(node => node.triangle)) return { toggleState: 'indeterminate' };
    // Only non-triangle nodes selected:
    return { toggleState: 'off' };
  };

  const toolboxItems: ToolboxItem[] = [
    { title: 'Undo', icon: IconArrowBackUp, action: undo, disabled: !canUndo(state), hotkey: 'Ctrl-Z',
      description: 'Undo the last action.' },
    { title: 'Redo', icon: IconArrowForwardUp, action: redo, disabled: !canRedo(state), hotkey: 'Ctrl-Y',
      description: 'Redo the last undone action.' },
    { title: 'Add', icon: IconPlus, action: addNode, disabled: nothingSelected, hotkey: 'Up',
      description: 'Add a new parent node for the selected text or nodes.' },
    { title: 'Delete', icon: IconTrash, action: deleteNode, disabled: noNodesSelected, hotkey: 'Backspace',
      description: 'Delete the selected nodes.' },
    { title: 'Edit', icon: IconPencil, action: startEditing, disabled: noNodesSelected, hotkey: 'Enter',
      toggleState: editedNodeIndicator ? 'on' : 'off', description: 'Edit the selected node.' },
    { title: 'Triangle', icon: IconTriangle, ...getTriangleButtonState(),
      action: (_, focusEvent) =>
        // Terrible hack to figure out if the user was in the middle of editing a node when they clicked the button
        toggleTriangle(focusEvent?.relatedTarget?.className === 'LabelNodeEditorInput'),
      description: 'Toggle triangle connectors for the selected terminal nodes.'
    },
    { title: 'Adopt', icon: IconAdoptNode, action: toggleAdoptMode, disabled: noNodesSelected,
      toggleState: selectionAction === 'adopt' ? 'on' : 'off',
      description: 'Adopt one or more nodes as children of the selected node.' },
    { title: 'Disown', icon: IconDisownNode, action: toggleDisownMode, disabled: noNodesSelected,
      toggleState: selectionAction === 'disown' ? 'on' : 'off',
      description: 'Disown one or more children of the selected node.' },
    { title: 'Reset position', icon: IconResetNodePosition, action: resetNodePositions, disabled: noNodesSelected,
      description: 'Relocate the selected nodes to their original positions.' },
  ];

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView
      plot={positionedPlot}
      selectedNodeIndicators={selectedNodeIndicators}
      editedNodeIndicator={editedNodeIndicator}
      onClick={handlePlotClick}
      onNodesSelect={handleNodesSelect}
      onSliceSelect={handleSliceSelect}
      onNodeEditStart={startEditing}
      onNodeMove={moveNodes}
      onNodeCreationTriggerClick={handleNodeCreationTriggerClick}
      onSentenceBlur={handleSentenceBlur}
      onSentenceChange={handleSentenceChange}
      onSentenceKeyDown={handleSentenceKeyDown}
      onNodeEditorBlur={handleNodeEditorBlur}
      onNodeEditorKeyDown={handleNodeEditorKeyDown}
    />
    <Toolbox items={toolboxItems} />
    <AboutButton />
    <PlotSelector
      plots={state.contentState.current.plots}
      activePlotIndex={activePlotIndex}
      onPlotSelect={setActivePlotIndex}
      onPlotAdd={addPlot}
      onPlotDelete={deletePlot}
    />
    {beginnersGuideActive ? <BeginnersGuide
      plotState={activePlot}
      onComplete={() => setBeginnersGuideActive(false)}
    /> : isEmpty(activePlot.trees) && <PlotPlaceholder
      onDemoRequest={() => setBeginnersGuideActive(true)}
    />}
  </MantineProvider>;
}

export default App;
