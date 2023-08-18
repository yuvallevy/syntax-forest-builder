@file:OptIn(ExperimentalJsExport::class)

package ui

import content.Id
import content.Sentence
import content.StringSlice
import content.positioned.*
import content.slicesOverlap

private const val MAX_TRIGGER_WIDTH = 32.0
private const val MAX_TRIGGER_PADDING_TOP = 28.0
private const val MAX_TRIGGER_PADDING_BOTTOM = 20.0

private val wordRegex = """['A-Za-z\u00c0-\u1fff]+""".toRegex()

private sealed interface NodeCreationTarget {
    val position: CoordsInTree
}

private data class BranchingNodeCreationTarget(
    override val position: CoordsInTree,
    val childIds: Set<Id>,
    val childPositions: Array<CoordsInTree>,
) : NodeCreationTarget

private data class TerminalNodeCreationTarget(
    override val position: CoordsInTree,
    val slice: StringSlice,
) : NodeCreationTarget

@JsExport
sealed interface NodeCreationTrigger {
    val origin: CoordsInTree
    val topLeft: CoordsInTree
    val bottomRight: CoordsInTree
}

@JsExport
data class BranchingNodeCreationTrigger internal constructor(
    override val origin: CoordsInTree,
    override val topLeft: CoordsInTree,
    override val bottomRight: CoordsInTree,
    internal val childIds: Set<Id>,
    val childPositions: Array<CoordsInTree>,
) : NodeCreationTrigger {
    val childIdsAsArray = childIds.toTypedArray()

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class.js != other::class.js) return false

        other as BranchingNodeCreationTrigger

        if (origin != other.origin) return false
        if (topLeft != other.topLeft) return false
        if (bottomRight != other.bottomRight) return false
        if (childIds != other.childIds) return false
        if (!childPositions.contentEquals(other.childPositions)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = origin.hashCode()
        result = 31 * result + topLeft.hashCode()
        result = 31 * result + bottomRight.hashCode()
        result = 31 * result + childIds.hashCode()
        result = 31 * result + childPositions.contentHashCode()
        return result
    }
}

@JsExport
data class TerminalNodeCreationTrigger(
    override val origin: CoordsInTree,
    override val topLeft: CoordsInTree,
    override val bottomRight: CoordsInTree,
    val slice: StringSlice,
) : NodeCreationTrigger

private fun getWordSlices(sentence: Sentence): Set<StringSlice> =
    wordRegex.findAll(sentence).map { StringSlice(it.range.first, it.range.last + 1) }.toSet()

private fun PositionedTree.getNodeCreationTargets(
    strWidthFunc: StrWidthFunc,
    selectedSlice: StringSlice?,
): Set<NodeCreationTarget> {
    // We only need node creation triggers to add parent nodes for top-level nodes, so discard the rest
    val topLevelNodeIds = sortNodesByXCoord(getTopLevelNodes().ids).toList()

    // We also need one trigger above each space between two horizontally adjacent nodes
    val topLevelNodeIdPairs = topLevelNodeIds.windowed(2)

    // Finally, we need one trigger for each word that isn't already assigned to a terminal node
    // and isn't part of the selection
    val unassignedWordSlices = getWordSlices(sentence).filter(this::isSliceUnassigned)
    val unassignedSlices =
        if (selectedSlice != null && !selectedSlice.isZeroLength && isSliceUnassigned(selectedSlice))
            unassignedWordSlices.filterNot { slicesOverlap(it, selectedSlice) } + selectedSlice
        else unassignedWordSlices

    // Find the targets for all of these triggers, i.e. where nodes can be added
    val parentNodeCreationTargets: Set<NodeCreationTarget> =
        (topLevelNodeIds.map { listOf(it) } + topLevelNodeIdPairs).map { nodeIds ->
            BranchingNodeCreationTarget(
                position = determineNaturalParentNodePosition(nodeIds.map { node(it).position }.toSet()),
                childIds = nodeIds.toSet(),
                childPositions = nodeIds.map { node(it).position }.toTypedArray(),
            )
        }.toSet()
    val terminalNodeCreationTargets: Set<NodeCreationTarget> = unassignedSlices.map { slice ->
        sliceOffsetAndWidth(strWidthFunc, sentence, slice).let { (widthBeforeSlice, sliceWidth) ->
            TerminalNodeCreationTarget(
                position = CoordsInTree(widthBeforeSlice + (sliceWidth / 2), -MAX_TRIGGER_PADDING_BOTTOM),
                slice = slice,
            )
        }
    }.toSet()

    return parentNodeCreationTargets + terminalNodeCreationTargets
}

@JsExport
fun PositionedTree.getNodeCreationTriggers(
    strWidthFunc: StrWidthFunc,
    selectedSlice: StringSlice?,
): Array<NodeCreationTrigger> =
    getNodeCreationTargets(strWidthFunc, selectedSlice).map { target ->
        val origin = target.position
        val topLeft = CoordsInTree(
            target.position.treeX - MAX_TRIGGER_WIDTH / 2, target.position.treeY - MAX_TRIGGER_PADDING_TOP
        )
        val bottomRight = CoordsInTree(
            target.position.treeX + MAX_TRIGGER_WIDTH / 2, target.position.treeY + MAX_TRIGGER_PADDING_BOTTOM
        )
        when (target) {
            is BranchingNodeCreationTarget ->
                BranchingNodeCreationTrigger(origin, topLeft, bottomRight, target.childIds, target.childPositions)

            is TerminalNodeCreationTarget -> TerminalNodeCreationTrigger(origin, topLeft, bottomRight, target.slice)
        }
    }.toTypedArray()
