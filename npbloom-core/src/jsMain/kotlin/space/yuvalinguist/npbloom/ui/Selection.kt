@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.NodeIndicatorInPlot

@JsExport
fun applyNodeSelection(
    mode: EntitySelectionMode,
    newNodeIndicators: Array<NodeIndicatorInPlot>,
    existingNodeIndicators: Array<NodeIndicatorInPlot> = emptyArray(),
): SelectionInPlot =
    applyNodeSelection(mode, newNodeIndicators.toSet(), existingNodeIndicators.toSet())

@JsExport
fun applyTreeSelection(
    mode: EntitySelectionMode,
    newTreeIds: Array<Id>,
    existingTreeIds: Array<Id> = emptyArray(),
): SelectionInPlot =
    applyTreeSelection(mode, newTreeIds.toSet(), existingTreeIds.toSet())
