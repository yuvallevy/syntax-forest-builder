import { useMemo, useReducer } from 'react';
import './App.scss';
import { applyNodePositionsToPlot } from './core/positioning';
import { Id, PositionedPlot, UnpositionedPlot } from './core/types';
import PlotView from './ui/PlotView';
import { initialState, reducer } from './ui/state';
import strWidth from './ui/strWidth';

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const activePlot: UnpositionedPlot = useMemo(() => state.plots[state.activePlotId], [state.plots, state.activePlotId]);
  const positionedPlot: PositionedPlot = useMemo(() => applyNodePositionsToPlot(strWidth)(activePlot), [activePlot]);

  const handleNodeSelect = (treeId: Id, nodeId: Id) => dispatch({
    type: 'selectNodes',
    plotId: state.activePlotId,
    treeIds: [treeId],
    nodeIds: [nodeId],
    mode: 'set',
  });

  return (
    <PlotView
      plot={positionedPlot}
      selectedNodeIds={state.selectedNodeIds}
      onNodeSelect={handleNodeSelect}
    />
  );
}

export default App;
