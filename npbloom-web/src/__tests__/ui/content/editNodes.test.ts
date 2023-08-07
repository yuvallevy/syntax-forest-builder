import { describe, expect, it } from 'vitest';
import { Sentence } from '../../../types';
import {
  idMap, NodeIndicatorInPlot, PlotCoordsOffset, set, StringSlice, TreeCoordsOffset, UnpositionedBranchingNode,
  UnpositionedTerminalNode, UnpositionedTree, jsNodeMapRepr
} from 'npbloom-core';
import { handleLocalSentenceChange, newNodeFromSelection } from '../../../ui/content/editNodes';

describe('high-level tree editing routines', () => {
  describe('defining new nodes', () => {
    it('defines a new branching node', () => {
      expect(newNodeFromSelection({
        nodeIndicators: [new NodeIndicatorInPlot('tree', 'a'), new NodeIndicatorInPlot('tree', 'b')]
      }, '')).toMatchObject({ targetChildIds: set(['a', 'b']) });
    });

    describe('defines a new terminal node', () => {
      const testSentencesForWordRanges: [Sentence, number, StringSlice][] = [
        // The word in...                          ...at position...     ...is in range...
        ['She will buy the red sweater.',          2,                    new StringSlice(0, 3)],
        ['I have nowhere to go.',                  18,                   new StringSlice(18, 20)],
        ['That was a big surprise, wasn\'t it?',   27,                   new StringSlice(25, 31)],
        ['Look at the blackboard!',                13,                   new StringSlice(12, 22)],
        ['Look\u2003at\u2003the\u2003blackboard!', 13,                   new StringSlice(12, 22)],
      ];

      it.each(testSentencesForWordRanges)(
        'finds that the word in "%s" intersecting position %d is in range %p',
        (sentence, position, expectedSlice) => {
          expect(newNodeFromSelection({ treeId: 'test', slice: new StringSlice(position, position) }, sentence))
            .toMatchObject({ targetSlice: expectedSlice, triangle: false });
        });
    });
  });

  describe('accommodating sentence changes', () => {
    const tree = new UnpositionedTree(
      'The dog jumped.',
      idMap({
        'branch1': new UnpositionedBranchingNode('NP', new TreeCoordsOffset(0, 0), set(['term1', 'term2'])),
        'term1': new UnpositionedTerminalNode('Det', new TreeCoordsOffset(0, 0), new StringSlice(0, 3)),
        'term2': new UnpositionedTerminalNode('N', new TreeCoordsOffset(0, 0), new StringSlice(4, 7)),
        'term3': new UnpositionedTerminalNode('VP', new TreeCoordsOffset(0, 0), new StringSlice(8, 14), true),
        'top': new UnpositionedBranchingNode('S', new TreeCoordsOffset(0, 5), set(['branch1', 'term3'])),
      }),
      new PlotCoordsOffset(0, 0),
    );

    it('sets the sentence associated with a tree', () => {
      expect(handleLocalSentenceChange('The dogs jumped.', new StringSlice(7, 7))(tree).sentence).toBe('The dogs jumped.');
    });

    it.each([
      ['The dogs jumped.', new StringSlice(7, 7)],
      ['The wdog jumped.', new StringSlice(4, 4)],
      ['The doug jumped.', new StringSlice(6, 6)],
      ['The og jumped.', new StringSlice(5, 5)],  // Backward delete from index 5
      ['The og jumped.', new StringSlice(4, 4)],  // Forward delete from index 4
      ['The dg jumped.', new StringSlice(6, 6)],  // Backward delete from index 6
      ['The dg jumped.', new StringSlice(5, 5)],  // Forward delete from index 5
      ['The do jumped.', new StringSlice(7, 7)],  // Backward delete from index 7
      ['The do jumped.', new StringSlice(6, 6)],  // Forward delete from index 6
      ['The g jumped.', new StringSlice(6, 6)],  // Backward word delete from index 6
      ['The d jumped.', new StringSlice(5, 5)],  // Forward word delete from index 5
    ] as [Sentence, StringSlice][])('reassigns terminal node slices when changing sentence to "%s"', (newSentence, oldSelection) => {
      expect(jsNodeMapRepr(handleLocalSentenceChange(newSentence, oldSelection)(tree).nodes)).toMatchSnapshot();
    });
  });
});