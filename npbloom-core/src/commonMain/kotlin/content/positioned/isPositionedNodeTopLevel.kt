@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.Id
import content.IdMap

@JsExport
fun isPositionedNodeTopLevel(nodes: IdMap<PositionedNode>, nodeId: Id) =
    nodes.none { it is PositionedBranchingNode && nodeId in it.children }
