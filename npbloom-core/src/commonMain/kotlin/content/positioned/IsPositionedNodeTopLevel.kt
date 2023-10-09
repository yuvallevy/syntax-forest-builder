@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.EntitySet
import content.Id
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
fun isPositionedNodeTopLevel(nodes: EntitySet<PositionedNode>, nodeId: Id) =
    nodes.none { it is PositionedBranchingNode && nodeId in it.children }
