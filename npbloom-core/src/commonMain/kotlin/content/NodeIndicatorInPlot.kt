@file:OptIn(ExperimentalJsExport::class)

package content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
data class NodeIndicatorInPlot(
    val treeId: Id,
    val nodeId: Id,
)
