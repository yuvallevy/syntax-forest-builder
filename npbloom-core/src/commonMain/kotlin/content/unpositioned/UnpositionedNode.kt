@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*
import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable
import kotlinx.serialization.Transient

@JsExport
@Serializable
sealed interface UnpositionedNode : NodeBase {
    val offset: TreeCoordsOffset
    fun withLabel(newLabel: NodeLabel): UnpositionedNode
    fun withOffset(newOffset: TreeCoordsOffset): UnpositionedNode
    fun changeOffset(offsetD: TreeCoordsOffset) = withOffset(offset + offsetD)
}

@JsExport
@Serializable
@SerialName("B")
data class UnpositionedBranchingNode internal constructor(
    @SerialName("i") override val id: Id,
    @SerialName("l") override val label: NodeLabel,
    @SerialName("o") override val offset: TreeCoordsOffset = TreeCoordsOffset.ZERO,
    @SerialName("Y") internal val children: Set<Id>,
    @SerialName("-") override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedNode {
    @Transient val childrenAsArray = children.toTypedArray()

    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
@SerialName("T")
data class UnpositionedTerminalNode internal constructor(
    @SerialName("i") override val id: Id,
    @SerialName("l") override val label: NodeLabel,
    @SerialName("o") override val offset: TreeCoordsOffset = TreeCoordsOffset.ZERO,
    @SerialName("s") val slice: StringSlice,
    @SerialName("^") val triangle: Boolean = false,
    @SerialName("-") override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
sealed interface UnpositionedStrandedNode : UnpositionedNode

@JsExport
@Serializable
@SerialName("PS")
data class UnpositionedPlainStrandedNode internal constructor(
    @SerialName("i") override val id: Id,
    @SerialName("l") override val label: NodeLabel,
    @SerialName("o") override val offset: TreeCoordsOffset = TreeCoordsOffset.ZERO,
    @SerialName("-") override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
@SerialName("FT")
data class UnpositionedFormerlyTerminalNode internal constructor(
    @SerialName("i") override val id: Id,
    @SerialName("l") override val label: NodeLabel,
    @SerialName("o") override val offset: TreeCoordsOffset = TreeCoordsOffset.ZERO,
    @SerialName("s") val formerSlice: StringSlice,
    @SerialName("^") val formerlyTriangle: Boolean,
    @SerialName("-") override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
@Serializable
@SerialName("FB")
data class UnpositionedFormerlyBranchingNode internal constructor(
    @SerialName("i") override val id: Id,
    @SerialName("l") override val label: NodeLabel,
    @SerialName("o") override val offset: TreeCoordsOffset = TreeCoordsOffset.ZERO,
    @SerialName("Y") internal val formerDescendants: EntitySet<UnpositionedNode>,
    @SerialName("-") override val yAlignMode: YAlignMode = YAlignMode.Bottom,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}
