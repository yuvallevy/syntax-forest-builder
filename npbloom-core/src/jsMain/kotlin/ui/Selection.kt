@file:OptIn(ExperimentalJsExport::class)

package ui

import content.NodeIndicatorInPlot

@JsExport
fun applySelection(
    mode: NodeSelectionMode,
    newNodeIndicators: Array<NodeIndicatorInPlot>,
    existingNodeIndicators: Array<NodeIndicatorInPlot> = emptyArray(),
): Array<NodeIndicatorInPlot> =
    applySelection(mode, newNodeIndicators.toSet(), existingNodeIndicators.toSet()).toTypedArray()
