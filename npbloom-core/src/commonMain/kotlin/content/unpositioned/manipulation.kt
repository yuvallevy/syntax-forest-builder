package content.unpositioned

import content.*

typealias NodeTransformFunc = (oldNode: UnpositionedNode) -> UnpositionedNode

sealed interface InsertedNode : NodeCommon {
    override val label: NodeLabel
    val targetParentId: Id?
}

internal data class InsertedBranchingNode(
    override val id: Id,
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetChildIds: Set<Id>,
) : InsertedNode

internal data class InsertedTerminalNode(
    override val id: Id,
    override val label: NodeLabel,
    override val targetParentId: Id?,
    val targetSlice: StringSlice,
    val triangle: Boolean,
) : InsertedNode

internal fun IdMap<UnpositionedNode>.descendantIds(node: UnpositionedBranchingNode): Set<Id> {
    val directChildren = node.children.map { this[it] }
    val indirectDescendantIds = directChildren.filterIsInstance<UnpositionedBranchingNode>().flatMap(::descendantIds)
    return node.children + indirectDescendantIds
}

internal fun IdMap<UnpositionedNode>.descendantsOf(node: UnpositionedBranchingNode): IdMap<UnpositionedNode> =
    IdMap(descendantIds(node).map { this[it]!! })

internal fun IdMap<UnpositionedNode>.toStrandedNode(node: UnpositionedNode): UnpositionedStrandedNode =
    when (node) {
        is UnpositionedBranchingNode ->
            UnpositionedFormerlyBranchingNode(node.id, node.label, node.offset, descendantsOf(node))

        is UnpositionedTerminalNode ->
            UnpositionedFormerlyTerminalNode(node.id, node.label, node.offset, node.slice, node.triangle)

        else -> UnpositionedPlainStrandedNode(node.id, node.label, node.offset)
    }

internal fun IdMap<UnpositionedNode>.unassignAsChildren(nodeIds: Set<Id>, node: UnpositionedNode): UnpositionedNode {
    if (node !is UnpositionedBranchingNode) return node

    val filteredChildren = node.children - nodeIds
    if (node.children == filteredChildren) return node

    if (filteredChildren.isEmpty()) return toStrandedNode(node)

    return node.copy(children = filteredChildren)
}

internal fun IdMap<UnpositionedNode>.insertNode(insertedNode: InsertedNode): IdMap<UnpositionedNode> {
    val nodeMapWithNewNode: IdMap<UnpositionedNode> = when (insertedNode) {
        is InsertedBranchingNode -> mapToNewIdMap {
            if (it is UnpositionedBranchingNode) it.copy(children = it.children - insertedNode.targetChildIds)
            else it
        } + UnpositionedBranchingNode(
            insertedNode.id,
            insertedNode.label,
            TreeCoordsOffset.ZERO,
            insertedNode.targetChildIds,
        )

        is InsertedTerminalNode -> this + UnpositionedTerminalNode(
            insertedNode.id,
            insertedNode.label,
            TreeCoordsOffset.ZERO,
            insertedNode.targetSlice,
            insertedNode.triangle,
        )
    }
    return if (insertedNode.targetParentId != null) {
        nodeMapWithNewNode.transformNodes(setOf(insertedNode.targetParentId!!)) {
            if (it is UnpositionedBranchingNode) it.copy(children = it.children + insertedNode.id)
            else it
        }
    } else nodeMapWithNewNode
}

internal fun IdMap<UnpositionedNode>.transformNodes(
    nodeIds: Set<Id>,
    transformFunc: NodeTransformFunc,
): IdMap<UnpositionedNode> =
    nodeIds.fold(this) { transformedNodes, nodeId ->
        if (nodeId in this) transformedNodes + transformFunc(this[nodeId]!!)
        else transformedNodes
    }

internal fun IdMap<UnpositionedNode>.deleteNodes(nodeIds: Set<Id>): IdMap<UnpositionedNode> {
    if (nodeIds.isEmpty() || isEmpty()) return this
    val filteredNodes = filter { it.id !in nodeIds }
    return filteredNodes.mapToNewIdMap { unassignAsChildren(nodeIds, it) }
}
