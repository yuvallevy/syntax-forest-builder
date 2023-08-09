@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.Id
import content.IdMap

@JsExport
fun isPositionedNodeTopLevel(nodes: IdMap<PositionedNode>, nodeId: Id) =
    nodes.none { (_, node) -> node is PositionedBranchingNode && nodeId in node.children }
