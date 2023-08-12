package ui.content

import content.Sentence
import content.StringSlice
import content.unpositioned.*
import ui.NodeSelectionInPlot
import ui.SelectionInPlot
import ui.SliceSelectionInPlot

private fun isWordChar(char: Char) = char == '\'' || (char.isLetterOrDigit())

/**
 * Returns the range of the word that the given position is within.
 */
private fun getWordRange(sentence: Sentence, position: Int): StringSlice {
    var start = position
    while (start > 0 && isWordChar(sentence[start - 1])) start--

    var end = position
    while (end < sentence.length && isWordChar(sentence[end])) end++

    return StringSlice(start, end)
}

/**
 * Returns the definition for a new node based on the current selection.
 * If the selection is a slice of length 0, expands it to span the word where the cursor currently is,
 * using the given sentence.
 */
fun newNodeFromSelection(selection: SelectionInPlot, sentence: Sentence): InsertedNode = when (selection) {
    is SliceSelectionInPlot -> {
        // A slice of the sentence is selected
        val sliceAfterSpread =
            if (selection.slice.isZeroLength) getWordRange(sentence, selection.slice.start) else selection.slice
        val (sliceStartAfterSpread, sliceEndAfterSpread) = sliceAfterSpread
        InsertedTerminalNode("", null, sliceAfterSpread,
            triangle = ' ' in sentence.slice(sliceStartAfterSpread until sliceEndAfterSpread))
    }

    is NodeSelectionInPlot -> {
        // One or more nodes are selected
        val selectedNodeIds = selection.nodeIndicators.map { it.nodeId }.toSet()
        InsertedBranchingNode("", null, selectedNodeIds)
    }
}

/**
 * Shifts the slice associated with a node by the given number of characters,
 * based on the kind of selection made and the operation done on it.
 * Node slices will not expand when adding characters, but may contract when removing characters.
 */
private fun UnpositionedNode.shiftNodeSliceAfterChange(oldSelection: StringSlice, shiftBy: Int): UnpositionedNode {
    if (                                         // If:
        this !is UnpositionedTerminalNode ||     // this is not a terminal node, or
        shiftBy == 0 ||                          // the sentence length did not change, or
        slice.endExclusive < oldSelection.start  // the selection was entirely after the node, then
    ) return this                                // no change is necessary

    var (newNodeSliceStart, newNodeSliceEnd) = slice
    if (oldSelection.isZeroLength) {  // No selection, just a cursor
        when {
            oldSelection.start == slice.start -> {  // Cursor was at the beginning of the slice
                newNodeSliceEnd += shiftBy
                if (shiftBy > 0) {  // If adding, move the slice forward; if removing, contract it
                    newNodeSliceStart += shiftBy
                }
            }
            oldSelection.start == slice.endExclusive -> {  // Cursor was at the end of the slice
                if (shiftBy < 0) {  // If removing, contract the slice
                    newNodeSliceEnd += shiftBy
                }
            }
            oldSelection.start < slice.start -> {  // Cursor was before the slice
                newNodeSliceStart += shiftBy
                newNodeSliceEnd += shiftBy
            }
            oldSelection.start in (slice.start + 1) until slice.endExclusive -> {  // Cursor was in the middle of the slice
                newNodeSliceEnd += shiftBy
            }
        }
    } else {  // A selection spanning at least one character was made
        TODO("Not implemented yet")
    }
    return UnpositionedTerminalNode(
        label, offset, StringSlice(newNodeSliceStart, newNodeSliceEnd), triangle
    )
}

/**
 * Responds to a change in the sentence associated with the given tree,
 * adapting existing nodes to the change if any exist.
 * @param newSentence The new sentence to use for the tree.
 * @param oldSelection The selection before the change was made.
 *   This is used to determine how exactly node ranges should change.
 */
fun UnpositionedTree.handleLocalSentenceChange(newSentence: Sentence, oldSelection: StringSlice) =
    UnpositionedTree(newSentence, nodes, offset).transformAllNodes {
        it.shiftNodeSliceAfterChange(oldSelection, newSentence.length - sentence.length)
    }
