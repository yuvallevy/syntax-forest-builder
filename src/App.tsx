import { useMemo, useReducer } from 'react';
import { MantineProvider } from '@mantine/core';
import theme from './theme';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import {
  Id, StringSlice, PositionedPlot, Sentence, UnpositionedPlot, TreeAndNodeId, NodeLabel, PlotCoordsOffset, isBranching,
  isTerminal, UnpositionedTerminalNode
} from './core/types';
import PlotView from './ui/PlotView';
import strWidth from './ui/strWidth';
import { generateNodeId, generateTreeId } from './ui/generateId';
import { SelectionInPlot } from './ui/editNodes';
import { applySelection, NodeSelectionMode } from './ui/selection';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { allTopLevelInPlot } from './mantle/plotManipulation';
import { getNodeIdsAssignedToSlice } from './mantle/manipulation';
import { initialUiState, uiReducer } from './ui/uiState';
import Toolbox, { ToolboxItem } from './ui/Toolbox';
import { NodeCreationTrigger } from './ui/nodeCreationTriggers';

const App = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState);
  const { selection, activePlotId, editingNode } = state;

  const nothingSelected = 'nodes' in selection && selection.nodes.length === 0;
  const selectedNodes = 'nodes' in selection ? selection.nodes : [];

  const activePlot: UnpositionedPlot =
    useMemo(() => state.contentState.current.plots[activePlotId], [state.contentState, activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const selectedNodeData = selectedNodes.map(({ treeId, nodeId }) => activePlot.trees[treeId].nodes[nodeId]);

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
  const toggleTriangle = () => dispatch({ type: 'toggleTriangle' });
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
    setSelection({ nodes: [] });
  };

  const handlePlotClick = (event: React.MouseEvent<SVGElement>) => {
    if (nothingSelected) {
      addTreeAndFocus({ dPlotX: event.clientX, dPlotY: event.clientY });
    } else {
      setSelection({ nodes: [] });
    }
  };

  const handleNodesSelect = (nodes: TreeAndNodeId[], mode: NodeSelectionMode = 'SET') => setSelection({
    nodes: applySelection(mode, nodes, 'nodes' in selection ? selection.nodes : undefined),
  });
  const handleSliceSelect = (treeId: Id, slice: StringSlice) => setSelection({ treeId, slice });

  const handleNodeCreationTriggerClick = (treeId: Id, trigger: NodeCreationTrigger) => {
    dispatch({
      type: 'addNodeByTarget',
      treeId,
      newNodeId: generateNodeId(),
      ...(
        'childIds' in trigger
          ? { targetChildIds: trigger.childIds }
          : { targetSlice: trigger.slice }
      ),
    });
  };

  const handleSentenceChange = (_: Id, newSentence: Sentence, oldSelectedSlice: StringSlice) => dispatch({
    type: 'setSentence',
    newSentence,
    oldSelectedSlice,
  });

  const handleSentenceKeyDown = (treeId: Id, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.currentTarget.blur();
      if ('slice' in selection &&
        getNodeIdsAssignedToSlice(selection.slice)(activePlot.trees[selection.treeId]).length === 0) {
        addNode();
      } else {
        selectParentNodes();
      }
    } else if ((event.key === 'Backspace' || event.key === 'Delete') && event.currentTarget.value === '') {
      removeAndDeselectTree(treeId);
    }
  };

  const handleNodeEditorBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    setEditedNodeLabel(event.currentTarget.value);
    stopEditing();
  };

  const handleNodeEditorKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (!editingNode) return;
    if (event.key === 'ArrowUp') {
      setEditedNodeLabel(event.currentTarget.value);
      if (allTopLevelInPlot([editingNode])(activePlot)) {
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
    if (selectedNodes.length > 0 && allTopLevelInPlot(selectedNodes)(activePlot)) {
      addNode();
    } else {
      selectParentNodes();
    }
  });

  useHotkeys(['ArrowLeft'], selectLeftChildNode);

  useHotkeys(['ArrowRight'], selectRightChildNode);

  useHotkeys(['ArrowDown'], () => {
    if (selectedNodes.length !== 1) return;
    const selectedNode = activePlot.trees[selectedNodes[0].treeId].nodes[selectedNodes[0].nodeId];
    if (isBranching(selectedNode)) {
      selectCenterChildNode();
    } else if (isTerminal(selectedNode)) {
      selectSliceAtDomLevel(selectedNodes[0].treeId, selectedNode.slice);
    }
  });

  useHotkeys(['Enter', 'F2'], startEditing);

  useHotkeys(['Backspace', 'Delete'], deleteNode);

  useHotkeys(['Control+z', 'Meta+z'], event => { event.preventDefault(); undo(); });

  useHotkeys(['Control+y', 'Meta+y'], event => { event.preventDefault(); redo(); });

  const getTriangleButtonState = (): { toggleState: 'on' | 'off' | 'indeterminate'; disabled?: boolean } => {
    // No nodes selected, or some non-terminal nodes selected:
    if (selectedNodes.length === 0 || !(selectedNodeData.every(isTerminal)))
      return { disabled: true, toggleState: 'off' };

    // At this point we know that there are selected nodes and that they are all terminal
    const selectedTerminalNodes = selectedNodeData as UnpositionedTerminalNode[];
    // Only triangle nodes selected:
    if (selectedTerminalNodes.every(node => node.triangle)) return { toggleState: 'on' };
    // Some triangle nodes and some non-triangle nodes selected:
    if (selectedTerminalNodes.some(node => node.triangle)) return { toggleState: 'indeterminate' };
    // Only non-triangle nodes selected:
    return { toggleState: 'off' };
  };

  const toolboxItems: ToolboxItem[] = [
    { title: 'Undo', action: undo },
    { title: 'Redo', action: redo },
    { title: 'Add', action: addNode },
    { title: 'Delete', action: deleteNode },
    { title: 'Edit', action: startEditing, toggleState: editingNode ? 'on' : 'off' },
    { title: 'Triangle', action: toggleTriangle, ...getTriangleButtonState() },
  ];

  return <MantineProvider withGlobalStyles withNormalizeCSS theme={theme}>
    <PlotView
      plot={positionedPlot}
      selectedNodes={selectedNodes}
      editing={editingNode}
      onClick={handlePlotClick}
      onNodesSelect={handleNodesSelect}
      onSliceSelect={handleSliceSelect}
      onNodeCreationTriggerClick={handleNodeCreationTriggerClick}
      onSentenceChange={handleSentenceChange}
      onSentenceKeyDown={handleSentenceKeyDown}
      onNodeEditorBlur={handleNodeEditorBlur}
      onNodeEditorKeyDown={handleNodeEditorKeyDown}
    />
    <Toolbox items={toolboxItems} />
  </MantineProvider>;
}

export default App;
