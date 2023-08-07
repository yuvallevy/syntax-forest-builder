@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*

typealias NodeTransformFunc = (oldNode: UnpositionedNode) -> UnpositionedNode

@JsExport
sealed interface InsertedNode : NodeCommon {
    override val label: NodeLabel
    val targetParentId: Id?
}

@JsExport
data class InsertedBranchingNode(
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetChildIds: Set<Id>,
) : InsertedNode

@JsExport
data class InsertedTerminalNode(
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetSlice: StringSlice,
    val triangle: Boolean,
) : InsertedNode

fun IdMap<UnpositionedNode>.descendantIds(node: UnpositionedBranchingNode): Set<Id> {
    val directChildren = node.children.map { this[it] }
    val indirectDescendantIds = directChildren.filterIsInstance<UnpositionedBranchingNode>().flatMap(::descendantIds)
    return node.children + indirectDescendantIds
}

fun IdMap<UnpositionedNode>.descendantsOf(node: UnpositionedBranchingNode): IdMap<UnpositionedNode> =
    descendantIds(node).associateWith { this[it]!! }

fun IdMap<UnpositionedNode>.toStrandedNode(node: UnpositionedNode): UnpositionedStrandedNode =
    when (node) {
        is UnpositionedBranchingNode ->
            UnpositionedFormerlyBranchingNode(node.label, node.offset, descendantsOf(node))

        is UnpositionedTerminalNode ->
            UnpositionedFormerlyTerminalNode(node.label, node.offset, node.slice, node.triangle)

        else -> UnpositionedPlainStrandedNode(node.label, node.offset)
    }

fun IdMap<UnpositionedNode>.unassignAsChildren(nodeIds: Set<Id>, node: UnpositionedNode): UnpositionedNode {
    if (node !is UnpositionedBranchingNode) return node

    val filteredChildren = node.children - nodeIds
    if (node.children == filteredChildren) return node

    if (filteredChildren.isEmpty()) return toStrandedNode(node)

    return node.copy(children = filteredChildren)
}

fun IdMap<UnpositionedNode>.setNodeById(nodeId: Id, newNode: UnpositionedNode) = this + (nodeId to newNode)

fun IdMap<UnpositionedNode>.insertNode(insertedNode: InsertedNode, nodeId: Id): IdMap<UnpositionedNode> {
    val nodeMapWithNewNode: IdMap<UnpositionedNode> = when (insertedNode) {
        is InsertedBranchingNode -> mapValues { (_, node) ->
            if (node is UnpositionedBranchingNode) node.copy(children = node.children - insertedNode.targetChildIds)
            else node
        }.setNodeById(
            nodeId,
            UnpositionedBranchingNode(insertedNode.label, TreeCoordsOffset.ZERO, insertedNode.targetChildIds),
        )

        is InsertedTerminalNode -> setNodeById(
            nodeId,
            UnpositionedTerminalNode(
                insertedNode.label,
                TreeCoordsOffset.ZERO,
                insertedNode.targetSlice,
                insertedNode.triangle
            )
        )
    }
    return if (insertedNode.targetParentId != null) {
        nodeMapWithNewNode.transformNodes(setOf(insertedNode.targetParentId!!)) {
            if (it is UnpositionedBranchingNode) it.copy(children = it.children + nodeId)
            else it
        }
    } else nodeMapWithNewNode
}

fun IdMap<UnpositionedNode>.transformNodes(
    nodeIds: Set<Id>,
    transformFunc: NodeTransformFunc,
): IdMap<UnpositionedNode> =
    nodeIds.fold(this) { transformedNodes, nodeId ->
        if (nodeId in this) transformedNodes.setNodeById(
            nodeId,
            transformFunc(this[nodeId]!!)
        ) else transformedNodes
    }

fun IdMap<UnpositionedNode>.deleteNodes(nodeIds: Set<Id>): IdMap<UnpositionedNode> {
    if (nodeIds.isEmpty() || isEmpty()) return this
    val filteredNodes = filterKeys { it !in nodeIds }
    return filteredNodes.mapValues { (_, node) -> unassignAsChildren(nodeIds, node) }
}
