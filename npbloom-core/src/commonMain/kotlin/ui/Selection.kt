@file:OptIn(ExperimentalJsExport::class)

package ui

import content.Id
import content.NodeIndicatorInPlot
import content.StringSlice
import content.positioned.PositionedNode
import content.positioned.PositionedTree
import content.unpositioned.UnpositionedPlot
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

@JsExport
sealed interface SelectionInPlot

@JsExport
data class NodeSelectionInPlot internal constructor(val nodeIndicators: Set<NodeIndicatorInPlot> = emptySet()) :
    SelectionInPlot {
    val nodeIndicatorsAsArray = nodeIndicators.toTypedArray()

    companion object {
        fun fromArray(nodeIndicatorArray: Array<NodeIndicatorInPlot>) = NodeSelectionInPlot(nodeIndicatorArray.toSet())
    }
}

@JsExport
data class SliceSelectionInPlot(val treeId: Id, val slice: StringSlice) : SelectionInPlot

@JsExport
enum class NodeSelectionAction { Select, Adopt, Disown }

@JsExport
enum class NodeSelectionMode { SetSelection, AddToSelection }

@JsName("applySelectionByKtSets")
fun applySelection(
    mode: NodeSelectionMode,
    newNodeIndicators: Set<NodeIndicatorInPlot>,
    existingNodeIndicators: Set<NodeIndicatorInPlot> = emptySet(),
): Set<NodeIndicatorInPlot> = when (mode) {
    NodeSelectionMode.AddToSelection -> existingNodeIndicators + newNodeIndicators
    NodeSelectionMode.SetSelection -> newNodeIndicators
}

/**
 * Removes nonexistent nodes from the given selection, based on the given plot.
 */
internal fun pruneSelection(selection: SelectionInPlot, plot: UnpositionedPlot): SelectionInPlot =
    when (selection) {
        is SliceSelectionInPlot -> if (selection.treeId in plot) selection else NodeSelectionInPlot(emptySet())
        is NodeSelectionInPlot -> NodeSelectionInPlot(selection.nodeIndicators.filter { it in plot }.toSet())
    }

@JsExport
fun isNodeInRect(tree: PositionedTree, node: PositionedNode, rect: RectInPlot) =
    calculateNodeCenterOnPlot(tree, node) in rect
