import { TreeAndNodeId } from './state';
import { Id, NodeSlice, Sentence } from '../core/types';
import { InsertedNode } from '../mantle/manipulation';

export type SelectionInPlot = { nodes: TreeAndNodeId[] } | { treeId: Id, slice: NodeSlice };

const isWordChar = (char: string) => /['A-Za-z\u00c0-\u1fff]/.test(char);

/**
 * Returns the range of the word that the given position is within.
 */
const getWordRange = (sentence: Sentence, position: number): [start: number, end: number] => {
  let start = position;
  while (start > 0 && isWordChar(sentence[start - 1])) start--;

  let end = position;
  while (end < sentence.length && isWordChar(sentence[end])) end++;

  return [start, end];
};

/**
 * Returns the definition for a new node based on the current selection.
 * If the selection is a slice of length 0, expands it to span the word where the cursor currently is,
 * using the given sentence.
 */
export const newNodeFromSelection = (selection: SelectionInPlot, sentence: Sentence): InsertedNode => {
  // A slice of the sentence is selected
  if ('slice' in selection) {
    const [sliceStart, sliceEnd] = selection.slice;
    const selectedSlice = sliceStart !== sliceEnd
      ? selection.slice
      : getWordRange(sentence, sliceStart);
    return {
      targetSlice: selectedSlice,
      label: '',
    };
  }
  // One or more nodes are selected
  const selectedNodeIds = selection.nodes.map(({ nodeId }) => nodeId);
  return {
    targetChildIds: selectedNodeIds,
    label: '',
  };
};
