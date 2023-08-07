import { Sentence } from '../../types';
import {
  InsertedBranchingNode, InsertedNode, InsertedTerminalNode, set, StringSlice, transformAllNodesInTree,
  UnpositionedNode, UnpositionedTerminalNode, UnpositionedTree
} from 'npbloom-core';
import { isSliceSelection, SelectionInPlot } from '../selection';

const isWordChar = (char: string) => /['A-Za-z\u00c0-\u1fff]/.test(char);

/**
 * Returns the range of the word that the given position is within.
 */
const getWordRange = (sentence: Sentence, position: number): StringSlice => {
  let start = position;
  while (start > 0 && isWordChar(sentence[start - 1])) start--;

  let end = position;
  while (end < sentence.length && isWordChar(sentence[end])) end++;

  return new StringSlice(start, end);
};

/**
 * Returns the definition for a new node based on the current selection.
 * If the selection is a slice of length 0, expands it to span the word where the cursor currently is,
 * using the given sentence.
 */
export const newNodeFromSelection = (selection: SelectionInPlot, sentence: Sentence): InsertedNode => {
  // A slice of the sentence is selected
  if (isSliceSelection(selection)) {
    const { start: rawSliceStart, endExclusive: rawSliceEnd } = selection.slice;
    const sliceAfterSpread = rawSliceStart !== rawSliceEnd
      ? selection.slice
      : getWordRange(sentence, rawSliceStart);
    const { start: sliceStartAfterSpread, endExclusive: sliceEndAfterSpread } = sliceAfterSpread;
    return new InsertedTerminalNode(
      '',
      null,
      sliceAfterSpread,
      sentence.slice(sliceStartAfterSpread, sliceEndAfterSpread).includes(' '),
    );
  }
  // One or more nodes are selected
  const selectedNodeIds = selection.nodeIndicators.map(({ nodeId }) => nodeId);
  return new InsertedBranchingNode(
    '',
    null,
    set(selectedNodeIds),
  );
};

/**
 * Shifts the slice associated with a node by the given number of characters,
 * based on the kind of selection made and the operation done on it.
 * Node slices will not expand when adding characters, but may contract when removing characters.
 */
const shiftNodeSliceAfterChange =
  (oldSelection: StringSlice, shiftBy: number) =>
  (node: UnpositionedNode): UnpositionedNode => {
    if (                                             // If:
      !(node instanceof UnpositionedTerminalNode) || // this is not a terminal node, or
      shiftBy === 0 ||                               // the sentence length did not change, or
      node.slice.endExclusive < oldSelection.start   // the selection was entirely after the node, then
    ) return node;                                   // no change is necessary

    const { start: oldNodeSliceStart, endExclusive: oldNodeSliceEnd } = node.slice;
    const newNodeSlice: [number, number] = [oldNodeSliceStart, oldNodeSliceEnd];
    if (oldSelection.isZeroLength) {  // No selection, just a cursor
      const oldCursorPos = oldSelection.start;
      if (oldCursorPos === oldNodeSliceStart) {  // Cursor was at the beginning of the slice
        newNodeSlice[1] += shiftBy;
        if (shiftBy > 0) {  // If adding, move the slice forward; if removing, contract it
          newNodeSlice[0] += shiftBy;
        }
      }
      if (oldCursorPos === oldNodeSliceEnd) {  // Cursor was at the end of the slice
        if (shiftBy < 0) {  // If removing, contract the slice
          newNodeSlice[1] += shiftBy;
        }
      }
      if (oldCursorPos < oldNodeSliceStart) {  // Cursor was before the slice
        newNodeSlice[0] += shiftBy;
        newNodeSlice[1] += shiftBy;
      }
      if (oldNodeSliceStart < oldCursorPos && oldCursorPos < oldNodeSliceEnd) {  // Cursor was in the middle of the slice
        newNodeSlice[1] += shiftBy;
      }
    } else {  // A selection spanning at least one character was made
      console.error('Not implemented yet');
    }
    return new UnpositionedTerminalNode(
      node.label, node.offset, new StringSlice(newNodeSlice[0], newNodeSlice[1]), node.triangle);
  }

/**
 * Responds to a change in the sentence associated with the given tree,
 * adapting existing nodes to the change if any exist.
 * @param newSentence The new sentence to use for the tree.
 * @param oldSelection The selection before the change was made.
 *   This is used to determine how exactly node ranges should change.
 */
export const handleLocalSentenceChange =
  (newSentence: Sentence, oldSelection: StringSlice) =>
  (tree: UnpositionedTree): UnpositionedTree => transformAllNodesInTree(
    shiftNodeSliceAfterChange(oldSelection, newSentence.length - tree.sentence.length),
    new UnpositionedTree(newSentence, tree.nodes, tree.offset));
