import { mapEntries } from '../core/objTransforms';
import { PositionedPlot } from '../core/types';
import TreeView from './TreeView';
import SentenceView from './SentenceView';
import './PlotView.scss';

interface PlotViewProps {
  plot: PositionedPlot;
}

const PlotView: React.FC<PlotViewProps> = ({ plot }) => <>
  <svg className="PlotView-svg" width="100%" height="100%">
    {mapEntries(plot.trees, ([treeId, tree]) => <TreeView key={`tree-${treeId}`} treeId={treeId} tree={tree} />)}
  </svg>
  {mapEntries(plot.trees, ([treeId, tree]) => <SentenceView key={`sentence-${treeId}`} tree={tree} onChange={console.log} />)}
</>;

export default PlotView;
