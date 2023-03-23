import { NodeSlice, Sentence } from '../../core/types';
import { newNodeFromSelection } from '../../ui/newNodes';

describe('defining new nodes', () => {
  it('defines a new branching node', () => {
    expect(newNodeFromSelection({ nodes: [{ treeId: 'tree', nodeId: 'a' }, { treeId: 'tree', nodeId: 'b' }] }, ''))
      .toMatchObject({ targetChildIds: ['a', 'b'] });
  });

  describe('defines a new terminal node', () => {
    const testSentencesForWordRanges: [Sentence, number, NodeSlice][] = [
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
