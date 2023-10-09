@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
interface WithPositionInTree {
    fun withPosition(treeX: TreeX, treeY: TreeY): PositionedNode

    val position: CoordsInTree
}
