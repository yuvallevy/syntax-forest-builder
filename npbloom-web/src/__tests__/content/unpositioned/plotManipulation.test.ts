import { describe, expect, it } from 'vitest';
import {
  idMap, jsTreeMapRepr, NodeIndicatorInPlot, PlotCoordsOffset, set, StringSlice, TreeCoordsOffset,
  UnpositionedBranchingNode, UnpositionedNode, UnpositionedPlot, UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';

describe('plot manipulation', () => {
  const plot = new UnpositionedPlot(
    idMap({
      'cleo': new UnpositionedTree(
        'Cleo laughed.',
        idMap({
          's1': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['np1', 'vp1'])),
          'np1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['n1'])),
          'n1': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
          'vp1': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(5, 12)),
        }),
        new PlotCoordsOffset(0, 0),
      ),
      'alex': new UnpositionedTree(
        'Alex baked cookies.',
        idMap({
          's2': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['np2a', 'vp2'])),
          'np2a': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['n2'])),
          'n2': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
          'vp2': new UnpositionedBranchingNode('VP', new TreeCoordsOffset(0, 0), set(['v2', 'np2b'])),
          'v2': new UnpositionedTerminalNode('V', new TreeCoordsOffset(0, 0), new StringSlice(5, 10)),
          'np2b': new UnpositionedTerminalNode('NP', new TreeCoordsOffset(0, 0), new StringSlice(11, 18)),
        }),
        new PlotCoordsOffset(0, 0),
      ),
    }),
  );

  const changeOffset4PxUp = (node: UnpositionedNode): UnpositionedNode => {
    if (node instanceof UnpositionedTerminalNode) return new UnpositionedTerminalNode(
      node.label, new TreeCoordsOffset(node.offset.dTreeX, node.offset.dTreeY - 4), node.slice, node.triangle);
    if (node instanceof UnpositionedBranchingNode) return new UnpositionedBranchingNode(
      node.label, new TreeCoordsOffset(node.offset.dTreeX, node.offset.dTreeY - 4), node.children);
    throw Error("not part of test scope")
  };

  it('retrieves the tree ID and parent node ID of a single node', () => {
    expect(plot.getParentNodeIds(set([new NodeIndicatorInPlot('alex', 'vp2')])))
      .toStrictEqual(set([new NodeIndicatorInPlot('alex', 's2')]));
  });

  it('retrieves the tree ID and parent node ID of two sibling nodes', () => {
    expect(plot.getParentNodeIds(set([new NodeIndicatorInPlot('alex', 'np2a'), new NodeIndicatorInPlot('alex', 'vp2')])))
      .toStrictEqual(set([new NodeIndicatorInPlot('alex', 's2')]));
  });

  it('retrieve the tree ID and parent node IDs of two non-sibling nodes on the same tree', () => {
    expect(plot.getParentNodeIds(set([new NodeIndicatorInPlot('alex', 'np2a'), new NodeIndicatorInPlot('alex', 'n2')])))
      .toStrictEqual(set([new NodeIndicatorInPlot('alex', 's2'), new NodeIndicatorInPlot('alex', 'np2a')]));
  });

  it('retrieves no parent node IDs for a top-level node', () => {
    expect(plot.getParentNodeIds(set([new NodeIndicatorInPlot('alex', 's2')])))
      .toStrictEqual(set([]));
  });

  it('retrieves only one tree ID and parent node ID for two non-sibling nodes on the same tree, ' +
    'of which one is a top-level node', () => {
    expect(plot.getParentNodeIds(set([new NodeIndicatorInPlot('alex', 's2'), new NodeIndicatorInPlot('alex', 'n2')])))
      .toStrictEqual(set([new NodeIndicatorInPlot('alex', 'np2a')]));
  });

  it('transforms nodes across multiple trees on one plot', () => {
    expect(jsTreeMapRepr(plot.transformNodes(
      changeOffset4PxUp, set([new NodeIndicatorInPlot('cleo', 'np1'), new NodeIndicatorInPlot('alex', 's2')])
    ).trees)).toMatchSnapshot();
  });

  it('deletes nodes across multiple trees on one plot', () => {
    expect(jsTreeMapRepr(plot.deleteNodes(
      set([new NodeIndicatorInPlot('cleo', 's1'), new NodeIndicatorInPlot('cleo', 'np1'), new NodeIndicatorInPlot('alex', 'vp2')])
    ).trees)).toMatchSnapshot();
  });
});
