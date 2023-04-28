import { useMemo, useReducer, useState } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, StringSlice, PositionedPlot, Sentence, UnpositionedPlot, TreeAndNodeId } from './core/types';
import PlotView from './ui/PlotView';
import { undoableReducer, undoableInitialState } from './ui/state';
import strWidth from './ui/strWidth';
import Toolbar, { ToolbarItem } from './ui/Toolbar';
import generateNodeId from './ui/generateNodeId';
import { newNodeFromSelection, SelectionInPlot } from './ui/editNodes';
import { applySelection, NodeSelectionMode } from './ui/NodeSelectionMode';
import useHotkeys from '@reecelucas/react-use-hotkeys';
import { allTopLevelInPlot, getParentNodeIdsInPlot } from './mantle/plotManipulation';
import { getNodeIdsAssignedToSlice } from './mantle/manipulation';

const App = () => {
  const [{ current: state }, dispatch] = useReducer(undoableReducer, undoableInitialState);
  const [activePlotId, setActivePlotId] = useState<Id>('plot');
  const [selection, setSelection] = useState<SelectionInPlot>({ nodes: [] });

  const selectedNodes = 'nodes' in selection ? selection.nodes : [];
  const setSelectedNodes = (nodes: TreeAndNodeId[], mode: NodeSelectionMode = 'SET') => setSelection({
    nodes: applySelection(mode, nodes, 'nodes' in selection ? selection.nodes : undefined),
  });
  const setSelectedSlice = (treeId: Id, slice: StringSlice) => setSelection({ treeId, slice });

  const activePlot: UnpositionedPlot = useMemo(() => state.plots[activePlotId], [state.plots, activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const [editingNode, setEditingNode] = useState<TreeAndNodeId | undefined>(undefined);

  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const addNode = () => {
    const treeId = 'treeId' in selection ? selection.treeId : selectedNodes[0].treeId;
    const newNodeId = generateNodeId();
    dispatch({
      type: 'insertNode',
      plotId: activePlotId,
      treeId,
      newNodeId,
      newNode: newNodeFromSelection(selection, activePlot.trees[treeId].sentence),
    });

    const newNodeIndicator = { treeId, nodeId: newNodeId };
    setSelectedNodes([newNodeIndicator]);
    setEditingNode(newNodeIndicator);
  };

  const deleteNode = () => dispatch({
    type: 'deleteNodes',
    plotId: activePlotId,
    nodes: selectedNodes,
  });

  const handleSentenceChange = (treeId: Id, newSentence: Sentence, oldSelection: StringSlice) => dispatch({
    type: 'setSentence',
    plotId: activePlotId,
    treeId,
    newSentence,
    oldSelection,
  });

  const toggleEditing = () => setEditingNode(!editingNode && selectedNodes.length === 1 ? selectedNodes[0] : undefined);

  const handleDoneEditing = (newLabel?: string) => {
    if (editingNode && newLabel !== undefined) {
      dispatch({
        type: 'setNodeLabel',
        plotId: activePlotId,
        node: editingNode,
        newLabel,
      })
    }
    setEditingNode(undefined);
  }

  const selectParentNodes = () => {
    if ('slice' in selection) {
      setSelectedNodes(getNodeIdsAssignedToSlice(selection.slice)(activePlot.trees[selection.treeId])
        .map(nodeId => ({ treeId: selection.treeId, nodeId })));
    } else {
      if (selectedNodes.length === 0) return;
      setSelectedNodes(getParentNodeIdsInPlot(selectedNodes)(activePlot));
    }
  };

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

  useHotkeys(['ArrowUp'], () => {
    if (selectedNodes.length > 0 && allTopLevelInPlot(selectedNodes)(activePlot)) {
      addNode();
    } else {
      selectParentNodes();
    }
  });

  const toolbarItems: ToolbarItem[] = [
    { title: 'Undo', action: undo },
    { title: 'Redo', action: redo },
    { title: 'Add', action: addNode },
    { title: 'Delete', action: deleteNode },
    { title: 'Edit', action: toggleEditing },
  ];

  return <>
    <Toolbar items={toolbarItems} />
    <PlotView
      plot={positionedPlot}
      selectedNodes={selectedNodes}
      editing={editingNode}
      onDoneEditing={handleDoneEditing}
      onNodesSelect={setSelectedNodes}
      onSliceSelect={setSelectedSlice}
      onSentenceChange={handleSentenceChange}
      onSentenceKeyDown={handleSentenceKeyDown}
    />
  </>;
}

export default App;
