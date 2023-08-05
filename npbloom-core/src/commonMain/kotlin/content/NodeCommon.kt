@file:OptIn(ExperimentalJsExport::class)

package content

typealias NodeLabel = String

@JsExport
interface NodeCommon {
    val label: NodeLabel
}
