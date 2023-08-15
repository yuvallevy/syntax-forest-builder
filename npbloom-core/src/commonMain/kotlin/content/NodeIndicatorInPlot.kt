@file:OptIn(ExperimentalJsExport::class)

package content

@JsExport
data class NodeIndicatorInPlot(
    val treeId: Id,
    val nodeId: Id,
)
