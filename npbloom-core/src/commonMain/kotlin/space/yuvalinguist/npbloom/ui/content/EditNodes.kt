package space.yuvalinguist.npbloom.ui.content

import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.Sentence
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.unpositioned.*
import space.yuvalinguist.npbloom.ui.NodeSelectionInPlot
import space.yuvalinguist.npbloom.ui.SelectionInPlot
import space.yuvalinguist.npbloom.ui.SliceSelectionInPlot

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
 * Spreads a zero-length slice to cover the entire word.
 */
fun spreadSlice(slice: StringSlice, sentence: Sentence) =
    if (slice.isZeroLength) getWordRange(sentence, slice.start) else slice

/**
 * Returns the definition for a new node based on the current selection.
 * If the selection is a slice of length 0, expands it to span the word where the cursor currently is,
 * using the given sentence.
 */
internal fun newNodeFromSelection(newNodeId: Id, selection: SelectionInPlot, sentence: Sentence): InsertedNode =
    when (selection) {
        is SliceSelectionInPlot -> {
            // A slice of the sentence is selected
            val sliceAfterSpread = spreadSlice(selection.slice, sentence)
            InsertedTerminalNode(
                newNodeId, "", null, sliceAfterSpread,
                triangle = sliceAfterSpread crossesWordBoundaryIn sentence
            )
        }

        is NodeSelectionInPlot -> {
            // One or more nodes are selected
            val selectedNodeIds = selection.nodeIndicators.map { it.nodeId }.toSet()
            InsertedBranchingNode(newNodeId, "", null, selectedNodeIds)
        }

        else -> error("Cannot create a new node from this selection ($selection)")
    }

/**
 * Shifts and/or resizes the slice by the given number of characters in response to a change in the sentence,
 * based on the kind of selection made and the operation done on it.
 * Node slices will not expand when adding characters, but may contract when removing characters.
 */
private fun StringSlice.shiftAfterChange(oldSelection: StringSlice, shiftBy: Int): StringSlice {
    if (shiftBy == 0) return this

    var (newStart, newEnd) = this
    if (oldSelection.isZeroLength) {  // No selection, just a cursor
        when {
            oldSelection.start == start -> {  // Cursor was at the beginning of the slice
                newEnd += shiftBy
                if (shiftBy > 0) {  // If adding, move the slice forward; if removing, contract it
                    newStart += shiftBy
                }
            }

            oldSelection.start == endExclusive -> {  // Cursor was at the end of the slice
                if (shiftBy < 0) {  // If removing, contract the slice
                    newEnd += shiftBy
                }
            }

            oldSelection.start < start -> {  // Cursor was before the slice
                newStart += shiftBy
                newEnd += shiftBy
            }

            oldSelection.start in (start + 1) until endExclusive -> {  // Cursor was in the middle of the slice
                newEnd += shiftBy
            }
        }
    } else {  // A selection spanning at least one character was made
        when {
            overlapsWith(oldSelection) -> {
                return StringSlice(oldSelection.start, oldSelection.start)
            }

            oldSelection.start < start -> {  // Selection was before the slice
                newStart += shiftBy
                newEnd += shiftBy
            }
        }
    }
    return StringSlice(newStart, newEnd)
}

private fun UnpositionedNode.shiftNodeSliceAfterChange(oldSelection: StringSlice, shiftBy: Int): UnpositionedNode {
    if (                                         // If:
        this !is UnpositionedTerminalNode ||     // this is not a terminal node, or
        shiftBy == 0 ||                          // the sentence length did not change, or
        slice.endExclusive < oldSelection.start  // the selection was entirely after the node, then
    ) return this                                // no change is necessary

    val newSlice = slice.shiftAfterChange(oldSelection, shiftBy)
    if (!oldSelection.isZeroLength && slice overlapsWith oldSelection) {
        return UnpositionedFormerlyTerminalNode(id, label, offset, newSlice, triangle)
    }
    return UnpositionedTerminalNode(id, label, offset, newSlice, triangle)
}

/**
 * Responds to a change in the sentence associated with the given tree,
 * adapting existing nodes to the change if any exist.
 * @param newSentence The new sentence to use for the tree.
 * @param oldSelection The selection before the change was made.
 *   This is used to determine how exactly node ranges should change.
 */
internal fun UnpositionedTree.handleLocalSentenceChange(newSentence: Sentence, oldSelection: StringSlice) =
    UnpositionedTree(id, newSentence, nodes, coordsInPlot).transformAllNodes {
        it.shiftNodeSliceAfterChange(oldSelection, newSentence.length - sentence.length)
    }
