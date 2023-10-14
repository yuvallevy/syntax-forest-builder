@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.positioned

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.Id
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

@JsExport
fun isPositionedNodeTopLevel(nodes: EntitySet<PositionedNode>, nodeId: Id) =
    nodes.none { it is PositionedBranchingNode && nodeId in it.children }
