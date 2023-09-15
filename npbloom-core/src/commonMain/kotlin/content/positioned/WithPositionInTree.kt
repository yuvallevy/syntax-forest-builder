@file:OptIn(ExperimentalJsExport::class)

package content.positioned

@JsExport
interface WithPositionInTree {
    fun withPosition(treeX: TreeX, treeY: TreeY): PositionedNode

    val position: CoordsInTree
}
