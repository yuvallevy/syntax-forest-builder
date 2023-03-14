import { useMemo, useReducer, useState } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, PositionedPlot, UnpositionedPlot } from './core/types';
import PlotView from './ui/PlotView';
import { undoableReducer, undoableInitialState, TreeAndNodeId } from './ui/state';
import strWidth from './ui/strWidth';
import Toolbar, { ToolbarItem } from './ui/Toolbar';
import generateNodeId from './ui/generateNodeId';

const App = () => {
  const [{ current: state }, dispatch] = useReducer(undoableReducer, undoableInitialState);

  const activePlot: UnpositionedPlot = useMemo(() => state.plots[state.activePlotId], [state.plots, state.activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const [editingNode, setEditingNode] = useState<{ treeId: Id, nodeId: Id } | undefined>(undefined);

  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const handleNodesSelect = (nodes: TreeAndNodeId[]) => dispatch({
    type: 'selectNodes',
    plotId: state.activePlotId,
    nodes,
    mode: 'set',
  });

  const addNode = () => {
    const newNodeId = generateNodeId();
    /* TODO: don't use two dispatches for this */
    dispatch({
      type: 'insertNode',
      plotId: state.activePlotId,
      treeId: state.selectedNodes[0].treeId,
      newNodeId,
      newNode: {
        targetChildIds: state.selectedNodes.map(({ nodeId }) => nodeId),
        label: '',
      },
    });
    dispatch({
      type: 'selectNodes',
      plotId: state.activePlotId,
      nodes: [{ treeId: state.selectedNodes[0].treeId, nodeId: newNodeId }],
      mode: 'set',
    });
    setEditingNode({ treeId: state.selectedNodes[0].treeId, nodeId: newNodeId });
  };

  const deleteNode = () => dispatch({
    type: 'deleteNodes',
    plotId: state.activePlotId,
    nodes: state.selectedNodes,
  });

  const toggleEditing = () => setEditingNode(!editingNode && state.selectedNodes.length === 1 ? state.selectedNodes[0] : undefined);

  const handleDoneEditing = (newLabel?: string) => {
    if (editingNode && newLabel !== undefined) {
      dispatch({
        type: 'setNodeLabel',
        plotId: state.activePlotId,
        node: editingNode,
        newLabel,
      })
    }
    setEditingNode(undefined);
  }

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
      selectedNodes={state.selectedNodes}
      editing={editingNode}
      onDoneEditing={handleDoneEditing}
      onNodesSelect={handleNodesSelect}
    />
  </>;
}

export default App;
