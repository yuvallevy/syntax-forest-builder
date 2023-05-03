import { describe, expect, it } from 'vitest';
import { StringSlice, Sentence, UnpositionedTree } from '../../core/types';
import { handleLocalSentenceChange, newNodeFromSelection } from '../../ui/editNodes';

describe('high-level tree editing routines', () => {
  describe('defining new nodes', () => {
    it('defines a new branching node', () => {
      expect(newNodeFromSelection({ nodes: [{ treeId: 'tree', nodeId: 'a' }, { treeId: 'tree', nodeId: 'b' }] }, ''))
        .toMatchObject({ targetChildIds: ['a', 'b'] });
    });

    describe('defines a new terminal node', () => {
      const testSentencesForWordRanges: [Sentence, number, StringSlice][] = [
        // The word in...                          ...at position...     ...is in range...
        ['She will buy the red sweater.',          2,                    [0, 3]],
        ['I have nowhere to go.',                  18,                   [18, 20]],
        ['That was a big surprise, wasn\'t it?',   27,                   [25, 31]],
        ['Look at the blackboard!',                13,                   [12, 22]],
        ['Look\u2003at\u2003the\u2003blackboard!', 13,                   [12, 22]],
      ];

      it.each(testSentencesForWordRanges)(
        'finds that the word in "%s" intersecting position %d is in range %p',
        (sentence, position, expectedSlice) => {
          expect(newNodeFromSelection({ treeId: 'test', slice: [position, position] }, sentence))
            .toMatchObject({ targetSlice: expectedSlice });
        });
    });
  });

  describe('accommodating sentence changes', () => {
    const tree: UnpositionedTree = {
      sentence: 'The dog jumped.',
      nodes: {
        'branch1': {
          label: 'NP',
          offset: { dTreeX: 0, dTreeY: 0 },
          children: ['term1', 'term2'],
        },
        'term1': {
          label: 'Det',
          offset: { dTreeX: 0, dTreeY: 0 },
          slice: [0, 3],
          triangle: false,
        },
        'term2': {
          label: 'N',
          offset: { dTreeX: 0, dTreeY: 0 },
          slice: [4, 7],
          triangle: false,
        },
        'term3': {
          label: 'VP',
          offset: { dTreeX: 0, dTreeY: 0 },
          slice: [8, 14],
          triangle: true,
        },
        'top': {
          label: 'S',
          offset: { dTreeX: 0, dTreeY: 5 },
          children: ['branch1', 'term3'],
        },
      },
      offset: { dPlotX: 0, dPlotY: 0 },
    };

    it('sets the sentence associated with a tree', () => {
      expect(handleLocalSentenceChange('The dogs jumped.', [7, 7])(tree).sentence).toBe('The dogs jumped.');
    });

    it.each([
      ['The dogs jumped.', [7, 7]],
      ['The wdog jumped.', [4, 4]],
      ['The doug jumped.', [6, 6]],
      ['The og jumped.', [5, 5]],  // Backward delete from index 5
      ['The og jumped.', [4, 4]],  // Forward delete from index 4
      ['The dg jumped.', [6, 6]],  // Backward delete from index 6
      ['The dg jumped.', [5, 5]],  // Forward delete from index 5
      ['The do jumped.', [7, 7]],  // Backward delete from index 7
      ['The do jumped.', [6, 6]],  // Forward delete from index 6
      ['The g jumped.', [6, 6]],  // Backward word delete from index 6
      ['The d jumped.', [5, 5]],  // Forward word delete from index 5
    ] as [Sentence, StringSlice][])('reassigns terminal node slices when changing sentence to "%s"', (newSentence, oldSelection) => {
      expect(handleLocalSentenceChange(newSentence, oldSelection)(tree).nodes).toMatchSnapshot();
    });
  });
});