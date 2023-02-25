import { useMemo, useReducer } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, PositionedPlot, UnpositionedPlot } from './core/types';
import PlotView from './ui/PlotView';
import { undoableReducer, undoableInitialState } from './ui/state';
import strWidth from './ui/strWidth';
import Toolbar, { ToolbarItem } from './ui/Toolbar';

const App = () => {
  const [{ current: state }, dispatch] = useReducer(undoableReducer, undoableInitialState);

  const activePlot: UnpositionedPlot = useMemo(() => state.plots[state.activePlotId], [state.plots, state.activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const handleNodesSelect = (treeIds: Id[], nodeIds: Id[]) => dispatch({
    type: 'selectNodes',
    plotId: state.activePlotId,
    treeIds: treeIds,
    nodeIds: nodeIds,
    mode: 'set',
  });

  const addNode = () => dispatch({
    type: 'insertNode',
    plotId: state.activePlotId,
    treeId: state.selectedTreeIds[0],
    newNodeId: '1J3I0',
    newNode: {
      targetChildIds: state.selectedNodeIds,
      label: 'S',
    },
  });

  const deleteNode = () => dispatch({
    type: 'deleteNodes',
    plotId: state.activePlotId,
    treeId: state.selectedTreeIds[0],
    nodeIds: state.selectedNodeIds,
  });

  const toolbarItems: ToolbarItem[] = [
    { title: 'Undo', action: undo },
    { title: 'Redo', action: redo },
    { title: 'Add', action: addNode },
    { title: 'Delete', action: deleteNode, }
  ];

  return <>
    <Toolbar items={toolbarItems} />
    <PlotView
      plot={positionedPlot}
      selectedNodeIds={state.selectedNodeIds}
      onNodesSelect={handleNodesSelect}
    />
  </>;
}

export default App;
