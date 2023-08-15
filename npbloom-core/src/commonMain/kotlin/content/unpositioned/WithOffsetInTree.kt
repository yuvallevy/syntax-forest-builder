@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

@JsExport
interface WithOffsetInTree {
    val offset: TreeCoordsOffset

    fun withOffset(newOffset: TreeCoordsOffset): UnpositionedNode

    fun changeOffset(offsetD: TreeCoordsOffset) = withOffset(offset + offsetD)
}
