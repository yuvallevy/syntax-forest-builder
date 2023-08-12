package ui

import content.Id
import content.NodeIndicatorInPlot
import content.StringSlice
import content.positioned.PositionedNode
import content.positioned.PositionedTree
import content.unpositioned.UnpositionedPlot

sealed interface SelectionInPlot
data class NodeSelectionInPlot(val nodeIndicators: Set<NodeIndicatorInPlot>) : SelectionInPlot
data class SliceSelectionInPlot(val treeId: Id, val slice: StringSlice) : SelectionInPlot

enum class NodeSelectionAction { Select, Adopt, Disown }
enum class NodeSelectionMode { SetSelection, AddToSelection }

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
fun pruneSelection(selection: SelectionInPlot, plot: UnpositionedPlot): SelectionInPlot =
    when (selection) {
        is SliceSelectionInPlot -> if (selection.treeId in plot) selection else NodeSelectionInPlot(emptySet())
        is NodeSelectionInPlot -> NodeSelectionInPlot(selection.nodeIndicators.filter { it in plot }.toSet())
    }

fun isNodeInRect(tree: PositionedTree, node: PositionedNode, rect: PlotRect) =
    calculateNodeCenterOnPlot(tree, node) in rect
