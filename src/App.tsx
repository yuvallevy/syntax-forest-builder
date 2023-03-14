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
  const [activePlotId, setActivePlotId] = useState<Id>('plot');
  const [selectedNodes, setSelectedNodes] = useState<TreeAndNodeId[]>([]);

  const activePlot: UnpositionedPlot = useMemo(() => state.plots[activePlotId], [state.plots, activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const [editingNode, setEditingNode] = useState<{ treeId: Id, nodeId: Id } | undefined>(undefined);

  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const addNode = () => {
    const newNodeId = generateNodeId();
    dispatch({
      type: 'insertNode',
      plotId: activePlotId,
      treeId: selectedNodes[0].treeId,
      newNodeId,
      newNode: {
        targetChildIds: selectedNodes.map(({ nodeId }) => nodeId),
        label: '',
      },
    });
    setSelectedNodes([{ treeId: selectedNodes[0].treeId, nodeId: newNodeId }]);
    setEditingNode({ treeId: selectedNodes[0].treeId, nodeId: newNodeId });
  };

  const deleteNode = () => dispatch({
    type: 'deleteNodes',
    plotId: activePlotId,
    nodes: selectedNodes,
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
    />
  </>;
}

export default App;
