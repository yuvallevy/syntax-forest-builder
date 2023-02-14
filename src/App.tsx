import { useMemo, useReducer } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, PositionedPlot, UnpositionedPlot } from './core/types';
import PlotView from './ui/PlotView';
import { undoableReducer, undoableInitialState } from './ui/state';
import strWidth from './ui/strWidth';

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

  const addS = () => dispatch({
    type: 'insertNode',
    plotId: 'plot',
    treeId: 'aa',
    newNodeId: 'a',
    newNode: {
      targetChildIds: ['b', 'd'],
      label: 'S',
    },
  });

  const deleteS = () => dispatch({
    type: 'deleteNodes',
    plotId: 'plot',
    treeId: 'aa',
    nodeIds: ['a'],
  });

  return <>
    <PlotView
      plot={positionedPlot}
      selectedNodeIds={state.selectedNodeIds}
      onNodesSelect={handleNodesSelect}
    />
    <button style={{ position: 'absolute', left: 0, top: 0 }} onClick={undo}>Undo</button>
    <button style={{ position: 'absolute', left: 80, top: 0 }} onClick={redo}>Redo</button>
    <button style={{ position: 'absolute', left: 160, top: 0 }} onClick={addS}>Add S</button>
    <button style={{ position: 'absolute', left: 240, top: 0 }} onClick={deleteS}>Delete S</button>
  </>;
}

export default App;
