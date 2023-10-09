@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
data class CoordsInTree(val treeX: TreeX, val treeY: TreeY)
