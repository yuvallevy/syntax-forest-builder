@file:OptIn(ExperimentalJsExport::class)

package ui

import content.Id
import content.Sentence
import content.StringSlice
import content.positioned.*
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

private const val MAX_TRIGGER_WIDTH = 32.0
private const val MAX_TRIGGER_PADDING_TOP = 28.0
private const val MAX_TRIGGER_PADDING_BOTTOM = 20.0

private val wordRegex = """['A-Za-z\u00c0-\u1fff]+""".toRegex()
private val spaceSequenceRegex = """\s{3,}""".toRegex()

private sealed interface NodeCreationTarget {
    val position: CoordsInTree
}

private data class BranchingNodeCreationTarget(
    override val position: CoordsInTree,
    val childIds: Set<Id>,
    val childPositions: List<CoordsInTree>,
) : NodeCreationTarget

private data class TerminalNodeCreationTarget(
    override val position: CoordsInTree,
    val slice: StringSlice,
    val triangle: TreeXRange? = null,
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
    @JsName("childIdsAsKtSet") val childIds: Set<Id>,
    @JsName("childPositionsAsKtList") val childPositions: List<CoordsInTree>,
) : NodeCreationTrigger {
    @JsName("childIds") val childIdsAsArray = childIds.toTypedArray()

    @JsName("childPositions") val childPositionsAsArray = childPositions.toTypedArray()
}

@JsExport
data class TerminalNodeCreationTrigger(
    override val origin: CoordsInTree,
    override val topLeft: CoordsInTree,
    override val bottomRight: CoordsInTree,
    val slice: StringSlice,
    val triangle: TreeXRange? = null,
) : NodeCreationTrigger

private fun getWordSlices(sentence: Sentence): Set<StringSlice> =
    wordRegex.findAll(sentence).map { StringSlice(it.range.first, it.range.last + 1) }.toSet()

/**
 * Finds slices corresponding to at least one space surrounded by one more space on each side.
 * These are likely to represent phonetically empty heads (e.g. I or T heads in some English sentences).
 */
private fun getSpaceSequenceSlices(sentence: Sentence): Set<StringSlice> =
    spaceSequenceRegex.findAll(sentence).map { StringSlice(it.range.first + 1, it.range.last) }.toSet()

private fun PositionedTree.getNodeCreationTargets(
    strWidthFunc: StrWidthFunc,
    selectedSlice: StringSlice?,
): Set<NodeCreationTarget> {
    // We only need node creation triggers to add parent nodes for top-level nodes, so discard the rest
    val topLevelNodeIds = sortNodesByXCoord(getTopLevelNodes().ids)

    // We also need one trigger above each space between two horizontally adjacent nodes
    val topLevelNodeIdPairs = topLevelNodeIds.windowed(2)

    // Finally, we need one trigger for each word that isn't already assigned to a terminal node
    // and isn't part of the selection
    val unassignedWordSlices = (getSpaceSequenceSlices(sentence) + getWordSlices(sentence)).filter(this::isSliceUnassigned)
    val unassignedSlices =
        if (selectedSlice != null && !selectedSlice.isZeroLength && isSliceUnassigned(selectedSlice))
            unassignedWordSlices.filterNot { it overlapsWith selectedSlice } + selectedSlice
        else unassignedWordSlices

    // Find the targets for all of these triggers, i.e. where nodes can be added
    val parentNodeCreationTargets: Set<NodeCreationTarget> =
        (topLevelNodeIds.map { listOf(it) } + topLevelNodeIdPairs).map { nodeIds ->
            BranchingNodeCreationTarget(
                position = determineNaturalParentNodePosition(nodeIds.map { node(it).position }.toSet()),
                childIds = nodeIds.toSet(),
                childPositions = nodeIds.map { node(it).position },
            )
        }.toSet()
    val terminalNodeCreationTargets: Set<NodeCreationTarget> = unassignedSlices.map { slice ->
        sliceOffsetAndWidth(strWidthFunc, sentence, slice).let { (widthBeforeSlice, sliceWidth) ->
            TerminalNodeCreationTarget(
                position = CoordsInTree(widthBeforeSlice + (sliceWidth / 2), -MAX_TRIGGER_PADDING_BOTTOM),
                slice = slice,
                triangle =
                    if (slice crossesWordBoundaryIn sentence)
                        TreeXRange(widthBeforeSlice, widthBeforeSlice + sliceWidth)
                    else null
            )
        }
    }.toSet()

    return parentNodeCreationTargets + terminalNodeCreationTargets
}

@JsName("getNodeCreationTriggersAsKtList")
fun PositionedTree.getNodeCreationTriggers(
    strWidthFunc: StrWidthFunc,
    selectedSlice: StringSlice?,
): List<NodeCreationTrigger> =
    getNodeCreationTargets(strWidthFunc, selectedSlice?.trimSpacesForString(sentence)).map { target ->
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

            is TerminalNodeCreationTarget ->
                TerminalNodeCreationTrigger(origin, topLeft, bottomRight, target.slice, target.triangle)
        }
    }
