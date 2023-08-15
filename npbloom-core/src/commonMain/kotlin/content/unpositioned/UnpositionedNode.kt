@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*

@JsExport
sealed interface UnpositionedNode : NodeCommon, WithOffsetInTree {
    fun withLabel(newLabel: NodeLabel): UnpositionedNode
}

@JsExport
data class UnpositionedBranchingNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    internal val children: Set<Id>,
) : UnpositionedNode {
    val childrenAsArray = children.toTypedArray()

    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedTerminalNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val slice: StringSlice,
    val triangle: Boolean = false,
) : UnpositionedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
sealed interface UnpositionedStrandedNode : UnpositionedNode

@JsExport
data class UnpositionedPlainStrandedNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedFormerlyTerminalNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerSlice: StringSlice,
    val formerlyTriangle: Boolean,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedFormerlyBranchingNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    internal val formerDescendants: IdMap<UnpositionedNode>,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}
