@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.NodeIndicatorInPlot
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.PositionedNode
import space.yuvalinguist.npbloom.content.positioned.PositionedTree
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedPlot
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

@JsExport
sealed interface SelectionInPlot

@JsExport
data object NoSelectionInPlot : SelectionInPlot

@JsExport
data class NodeSelectionInPlot(val nodeIndicators: Set<NodeIndicatorInPlot> = emptySet()) : SelectionInPlot {
    init {
        if (nodeIndicators.isEmpty()) error("Empty NodeSelectionInPlot - should not happen")
    }

    val nodeIndicatorsAsArray = nodeIndicators.toTypedArray()
}

@JsExport
data class SliceSelectionInPlot(val treeId: Id, val slice: StringSlice) : SelectionInPlot

/**
 * If there are any node indicators in this collection, returns a NodeSelectionInPlot object consisting of them.
 * Otherwise, returns a NoSelectionInPlot object.
 * Use this instead of instantiating NodeIndicatorInPlot directly when it is unknown whether the collection is empty.
 */
internal fun Collection<NodeIndicatorInPlot>.asSelectionInPlot() =
    if (isEmpty()) NoSelectionInPlot else NodeSelectionInPlot(toSet())

@JsExport
enum class NodeSelectionAction { Select, Adopt, Disown }

@JsExport
enum class NodeSelectionMode { SetSelection, AddToSelection }

@JsName("applySelectionByKtSets")
fun applySelection(
    mode: NodeSelectionMode,
    newNodeIndicators: Set<NodeIndicatorInPlot>,
    existingNodeIndicators: Set<NodeIndicatorInPlot> = emptySet(),
): SelectionInPlot = when (mode) {
    NodeSelectionMode.AddToSelection -> existingNodeIndicators + newNodeIndicators
    NodeSelectionMode.SetSelection -> newNodeIndicators
}.asSelectionInPlot()

/**
 * Removes nonexistent nodes from the given selection, based on the given plot.
 */
internal fun pruneSelection(selection: SelectionInPlot, plot: UnpositionedPlot): SelectionInPlot =
    when (selection) {
        NoSelectionInPlot -> NoSelectionInPlot
        is SliceSelectionInPlot -> if (selection.treeId in plot) selection else NoSelectionInPlot
        is NodeSelectionInPlot -> selection.nodeIndicators.filter { it in plot }.asSelectionInPlot()
    }

@JsExport
fun isNodeInRect(tree: PositionedTree, node: PositionedNode, rect: RectInPlot) =
    calculateNodeCenterOnPlot(tree, node) in rect
