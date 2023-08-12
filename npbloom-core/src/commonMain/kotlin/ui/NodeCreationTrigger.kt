package ui

import content.IdMap
import content.Sentence
import content.StringSlice
import content.positioned.*

private const val MAX_TRIGGER_WIDTH = 32.0
private const val MAX_TRIGGER_PADDING_TOP = 28.0
private const val MAX_TRIGGER_PADDING_BOTTOM = 20.0

private val wordRegex = """['A-Za-z\u00c0-\u1fff]+""".toRegex()

private sealed interface NodeCreationTarget {
    val position: CoordsInTree
}

private data class BranchingNodeCreationTarget(
    override val position: CoordsInTree,
    val childPositions: IdMap<CoordsInTree>,
) : NodeCreationTarget

private data class TerminalNodeCreationTarget(
    override val position: CoordsInTree,
    val slice: StringSlice,
) : NodeCreationTarget

sealed interface NodeCreationTrigger {
    val origin: CoordsInTree
    val topLeft: CoordsInTree
    val bottomRight: CoordsInTree
}

data class BranchingNodeCreationTrigger(
    override val origin: CoordsInTree,
    override val topLeft: CoordsInTree,
    override val bottomRight: CoordsInTree,
    val childPositions: IdMap<CoordsInTree>,
) : NodeCreationTrigger

data class TerminalNodeCreationTrigger(
    override val origin: CoordsInTree,
    override val topLeft: CoordsInTree,
    override val bottomRight: CoordsInTree,
    val slice: StringSlice,
) : NodeCreationTrigger

private fun getWordSlices(sentence: Sentence): Set<StringSlice> =
    wordRegex.findAll(sentence).map { StringSlice(it.range.first, it.range.last + 1) }.toSet()

private fun PositionedTree.getNodeCreationTargets(strWidthFunc: StrWidthFunc): Set<NodeCreationTarget> {
    // We only need node creation triggers to add parent nodes for top-level nodes, so discard the rest
    val topLevelNodeIds = sortNodesByXCoord(getTopLevelNodes().keys).toList()

    // We also need one trigger above each space between two horizontally adjacent nodes
    val topLevelNodeIdPairs = topLevelNodeIds.windowed(2)

    // Finally, we need one trigger for each word that isn't already assigned to a terminal node
    val unassignedSlices = getWordSlices(sentence).filter(this::isSliceUnassigned)

    // Find the targets for all of these triggers, i.e. where nodes can be added
    val parentNodeCreationTargets: Set<NodeCreationTarget> = (topLevelNodeIds.map { listOf(it) } + topLevelNodeIdPairs)
        .map { nodeIds ->
            BranchingNodeCreationTarget(
                position = determineNaturalParentNodePosition(nodeIds.map { node(it).position }.toSet()),
                childPositions = nodeIds.associateWith { node(it).position },
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

fun PositionedTree.getNodeCreationTriggers(strWidthFunc: StrWidthFunc): Set<NodeCreationTrigger> =
    getNodeCreationTargets(strWidthFunc).map { target ->
        val origin = target.position
        val topLeft = CoordsInTree(
            target.position.treeX - MAX_TRIGGER_WIDTH / 2,
            target.position.treeY - MAX_TRIGGER_PADDING_TOP
        )
        val bottomRight = CoordsInTree(
            target.position.treeX + MAX_TRIGGER_WIDTH / 2,
            target.position.treeY + MAX_TRIGGER_PADDING_BOTTOM
        )
        when (target) {
            is BranchingNodeCreationTarget ->
                BranchingNodeCreationTrigger(origin, topLeft, bottomRight, target.childPositions)

            is TerminalNodeCreationTarget ->
                TerminalNodeCreationTrigger(origin, topLeft, bottomRight, target.slice)
        }
    }.toSet()
