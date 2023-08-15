@file:OptIn(ExperimentalJsExport::class)

package content.positioned

@JsExport
interface WithPositionInTree {
    val position: CoordsInTree
}
