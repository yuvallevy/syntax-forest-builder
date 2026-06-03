@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.PositionedTree
import space.yuvalinguist.npbloom.content.positioned.StrWidthFunc

@JsExport
@JsName("getNodeCreationTriggers")
fun PositionedTree.getNodeCreationTriggersAsArray(
    strWidthFunc: StrWidthFunc,
    selectionInPlot: SelectionInPlot,
): Array<NodeCreationTrigger> =
    getNodeCreationTriggers(strWidthFunc, selectionInPlot).toTypedArray()
