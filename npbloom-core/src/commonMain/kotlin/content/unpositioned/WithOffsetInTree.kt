@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

@JsExport
interface WithOffsetInTree {
    val offset: TreeCoordsOffset
}
