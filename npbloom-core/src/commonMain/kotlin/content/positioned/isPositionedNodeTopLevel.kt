@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.Id
import content.EntitySet

@JsExport
fun isPositionedNodeTopLevel(nodes: EntitySet<PositionedNode>, nodeId: Id) =
    nodes.none { it is PositionedBranchingNode && nodeId in it.children }
