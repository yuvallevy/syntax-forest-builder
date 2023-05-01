import { useMemo, useReducer } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, StringSlice, PositionedPlot, Sentence, UnpositionedPlot, TreeAndNodeId, NodeLabel } from './core/types';
import PlotView from './ui/PlotView';
import strWidth from './ui/strWidth';
import Toolbar, { ToolbarItem } from './ui/Toolbar';
import generateNodeId from './ui/generateNodeId';
import { SelectionInPlot } from './ui/editNodes';
import { applySelection, NodeSelectionMode } from './ui/NodeSelectionMode';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { allTopLevelInPlot } from './mantle/plotManipulation';
import { getNodeIdsAssignedToSlice } from './mantle/manipulation';
import { initialUiState, uiReducer } from './ui/uiState';

const App = () => {
  const [state, dispatch] = useReducer(uiReducer, initialUiState);
  const { selection, activePlotId, editingNode } = state;

  const selectedNodes = 'nodes' in selection ? selection.nodes : [];

  const activePlot: UnpositionedPlot =
    useMemo(() => state.contentState.current.plots[activePlotId], [state.contentState, activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const setSelection = (newSelection: SelectionInPlot) => dispatch({ type: 'setSelection', newSelection });
  const selectParentNodes = () => dispatch({ type: 'selectParentNodes' });
  const startEditing = () => dispatch({ type: 'startEditing' });
  const stopEditing = () => dispatch({ type: 'stopEditing' });
  const setEditedNodeLabel = (newLabel: NodeLabel) => dispatch({ type: 'setEditedNodeLabel', newLabel });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });
  const deleteNode = () => dispatch({ type: 'deleteSelectedNodes' });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const handleNodesSelect = (nodes: TreeAndNodeId[], mode: NodeSelectionMode = 'SET') => setSelection({
    nodes: applySelection(mode, nodes, 'nodes' in selection ? selection.nodes : undefined),
  });
  const handleSliceSelect = (treeId: Id, slice: StringSlice) => setSelection({ treeId, slice });

  const handleSentenceChange = (treeId: Id, newSentence: Sentence, oldSelectedSlice: StringSlice) => dispatch({
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

  useHotkeys(['Enter', 'F2'], startEditing);

  useHotkeys(['Backspace', 'Delete'], deleteNode);

  useHotkeys(['Control+z', 'Meta+z'], event => { event.preventDefault(); undo(); });

  useHotkeys(['Control+y', 'Meta+y'], event => { event.preventDefault(); redo(); });

  const toolbarItems: ToolbarItem[] = [
    { title: 'Undo', action: undo },
    { title: 'Redo', action: redo },
    { title: 'Add', action: addNode },
    { title: 'Delete', action: deleteNode },
    { title: 'Edit', action: startEditing },
  ];

  return <>
    <Toolbar items={toolbarItems} />
    <PlotView
      plot={positionedPlot}
      selectedNodes={selectedNodes}
      editing={editingNode}
      onNodesSelect={handleNodesSelect}
      onSliceSelect={handleSliceSelect}
      onSentenceChange={handleSentenceChange}
      onSentenceKeyDown={handleSentenceKeyDown}
      onNodeEditorBlur={handleNodeEditorBlur}
      onNodeEditorKeyDown={handleNodeEditorKeyDown}
    />
  </>;
}

export default App;
