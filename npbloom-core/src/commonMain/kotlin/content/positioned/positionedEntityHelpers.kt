@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.Id
import content.IdMap
import content.StringSlice
import content.slicesOverlap

/**
 * Returns nodes matching the given predicate in the given tree.
 */
@JsExport
fun filterPositionedNodesInTree(
    predicate: (node: PositionedNode) -> Boolean,
    tree: PositionedTree,
): IdMap<PositionedNode> = tree.nodes.filterValues(predicate)

/**
 * Returns nodes with the given IDs in the given tree.
 */
@JsExport
fun filterPositionedNodesInTreeById(nodeIds: Set<Id>, tree: PositionedTree): IdMap<PositionedNode> =
    tree.nodes.filterKeys { it in nodeIds }

/**
 * Returns whether the node with the given ID is a top-level node in the given node ID map.
 */
@JsExport
fun isTopLevel(nodes: IdMap<PositionedNode>, nodeId: Id) =
    nodes.none { (_, node) -> node is PositionedBranchingNode && nodeId in node.children }

/**
 * Returns an ID map consisting of the top-level nodes in the given tree.
 */
@JsExport
fun getTopLevelPositionedNodes(tree: PositionedTree): IdMap<PositionedNode> =
    tree.nodes.filterKeys { isTopLevel(tree.nodes, it) }

/**
 * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
 */
@JsExport
fun sortPositionedNodesByXCoord(tree: PositionedTree, nodeIds: Set<Id>): Array<Id> =
    nodeIds.sortedBy { tree.nodes[it]!!.position.treeX }.toTypedArray()

/**
 * Returns true if there are no nodes assigned to any slices overlapping the given one.
 */
@JsExport
fun isSliceUnassigned(tree: PositionedTree, slice: StringSlice) =
    tree.nodes.count { (_, node) -> node is PositionedTerminalNode && slicesOverlap(node.slice, slice) } == 0
