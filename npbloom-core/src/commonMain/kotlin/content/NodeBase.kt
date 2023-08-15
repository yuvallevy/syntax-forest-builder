@file:OptIn(ExperimentalJsExport::class)

package content

typealias NodeLabel = String

@JsExport
interface NodeBase : WithId {
    val label: NodeLabel
}
