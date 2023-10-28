@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.NodeIndicatorInPlot

@JsExport
fun applySelection(
    mode: NodeSelectionMode,
    newNodeIndicators: Array<NodeIndicatorInPlot>,
    existingNodeIndicators: Array<NodeIndicatorInPlot> = emptyArray(),
): SelectionInPlot =
    applySelection(mode, newNodeIndicators.toSet(), existingNodeIndicators.toSet())
