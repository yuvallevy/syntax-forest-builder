@file:OptIn(ExperimentalJsExport::class)

package content

typealias NodeLabel = String

@JsExport
interface NodeCommon : WithId {
    val label: NodeLabel
}
