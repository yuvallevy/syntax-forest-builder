@file:OptIn(ExperimentalJsExport::class)

package ui

import content.StringSlice
import content.positioned.PositionedTree
import content.positioned.StrWidthFunc

@JsExport
@JsName("getNodeCreationTriggers")
fun PositionedTree.getNodeCreationTriggersAsArray(
    strWidthFunc: StrWidthFunc,
    selectedSlice: StringSlice?,
): Array<NodeCreationTrigger> =
    getNodeCreationTriggers(strWidthFunc, selectedSlice).toTypedArray()
