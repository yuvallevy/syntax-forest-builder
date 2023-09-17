@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@JsExport
@Serializable
sealed interface UnpositionedNode : NodeBase, WithOffsetInTree {
    fun withLabel(newLabel: NodeLabel): UnpositionedNode
}

@JsExport
@Serializable
data class UnpositionedBranchingNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    internal val children: Set<Id>,
    override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedNode {
    @Transient val childrenAsArray = children.toTypedArray()

    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
data class UnpositionedTerminalNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val slice: StringSlice,
    val triangle: Boolean = false,
    override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
sealed interface UnpositionedStrandedNode : UnpositionedNode

@JsExport
@Serializable
data class UnpositionedPlainStrandedNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
data class UnpositionedFormerlyTerminalNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerSlice: StringSlice,
    val formerlyTriangle: Boolean,
    override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
data class UnpositionedFormerlyBranchingNode internal constructor(
    override val id: Id,
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    internal val formerDescendants: EntitySet<UnpositionedNode>,
    override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}
