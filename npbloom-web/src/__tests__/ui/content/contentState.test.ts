import { describe, expect, it } from 'vitest';
import {
  idMap, InsertedBranchingNode, jsPlotRepr, NodeIndicatorInPlot, PlotCoordsOffset, set, StringSlice, TreeCoordsOffset,
  UnpositionedBranchingNode, UnpositionedPlot, UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';
import { ContentAction, contentReducer, ContentState, UndoableContentState } from '../../../ui/content/contentState';

describe('content state', () => {
  const initialState: ContentState = {
    plots: [
      new UnpositionedPlot(
        idMap({
          'aa': new UnpositionedTree(
            'tree state',
            idMap({
              'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 4)),
              'b': new UnpositionedTerminalNode('N', new TreeCoordsOffset(1, 10), new StringSlice(5, 10)),
            }),
            new PlotCoordsOffset(0, 0),
          ),
          'zz': new UnpositionedTree(
            'nodes rock',
            idMap({
              'w': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(-1, 5), set(['x'])),
              'x': new UnpositionedTerminalNode('N', new TreeCoordsOffset(1, 8), new StringSlice(0, 5)),
              'y': new UnpositionedTerminalNode('V', new TreeCoordsOffset(0, 0), new StringSlice(6, 10)),
            }),
            new PlotCoordsOffset(60, 0),
          ),
        }),
      ),
      new UnpositionedPlot(
        idMap({
          'aa': new UnpositionedTree(
            'syntax is fun',
            idMap({
              'a': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(0, 6)),
              'b': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(1, 10), new StringSlice(7, 13), true),
            }),
            new PlotCoordsOffset(20, 10),
          ),
        }),
      ),
    ],
  };

  const undoableInitialState: UndoableContentState = {
    current: initialState,
    undoStack: [],
    redoStack: [],
  };

  const testCases: [string, ContentAction][] = [
    [
      'adds a plot',
      { type: 'addPlot' }
    ],
    [
      'deletes a plot',
      { type: 'deletePlot', plotIndex: 0 }
    ],
    [
      'inserts a node into a tree',
      {
        type: 'insertNode',
        plotIndex: 0,
        treeId: 'aa',
        newNodeId: 'c',
        newNode: new InsertedBranchingNode('NP', null, set(['a', 'b']))
      }
    ],
    [
      'deletes a node from a tree',
      { type: 'deleteNodes', plotIndex: 0, nodeIndicators: [new NodeIndicatorInPlot('aa', 'b')] }
    ],
    [
      'deletes two nodes from two different trees',
      {
        type: 'deleteNodes',
        plotIndex: 0,
        nodeIndicators: [new NodeIndicatorInPlot('aa', 'b'), new NodeIndicatorInPlot('zz', 'x')]
      }
    ],
    [
      'sets a node as a child of another',
      { type: 'adoptNodes', plotIndex: 0, treeId: 'zz', adoptingNodeId: 'x', adoptedNodeIds: ['y'] }
    ],
    [
      'removes a connection between two nodes',
      { type: 'disownNodes', plotIndex: 0, treeId: 'zz', disowningNodeId: 'w', disownedNodeIds: ['x'] }
    ],
    [
      'moves a node in a tree',
      { type: 'moveNodes', plotIndex: 0, nodeIndicators: [new NodeIndicatorInPlot('aa', 'a')], dx: 1, dy: -4 }
    ],
    [
      'resets the positions of two nodes in two different trees',
      {
        type: 'resetNodePositions',
        plotIndex: 0,
        nodeIndicators: [new NodeIndicatorInPlot('aa', 'b'), new NodeIndicatorInPlot('zz', 'w')]
      }
    ],
    [
      'sets the label of a node',
      { type: 'setNodeLabel', plotIndex: 0, nodeIndicator: new NodeIndicatorInPlot('aa', 'a'), newLabel: 'NP' }
    ],
    [
      'sets whether a terminal node connects to its slice with a triangle',
      { type: 'setTriangle', plotIndex: 0, nodeIndicators: [new NodeIndicatorInPlot('aa', 'b')], triangle: true }
    ],
    [
      'reacts to a change in the sentence',
      {
        type: 'setSentence',
        plotIndex: 0,
        treeId: 'aa',
        newSentence: 'tee state',
        oldSelectedSlice: new StringSlice(2, 2)
      }
    ],
    [
      'adds a tree to a plot',
      { type: 'addTree', plotIndex: 0, newTreeId: 'zz', offset: new PlotCoordsOffset(105, 88) }
    ],
    [
      'removes a tree from a plot',
      { type: 'removeTree', plotIndex: 0, treeId: 'aa' }
    ],
  ];

  it.each(testCases)('%s', (_, action) => expect({
    plots: contentReducer(undoableInitialState, action).current.plots.map(jsPlotRepr)
  }).toMatchSnapshot());
});
