@file:OptIn(ExperimentalJsExport::class)

package content

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

typealias NodeLabel = String

@JsExport
interface NodeBase : WithId {
    val label: NodeLabel
    val yAlignMode: YAlignMode
}
