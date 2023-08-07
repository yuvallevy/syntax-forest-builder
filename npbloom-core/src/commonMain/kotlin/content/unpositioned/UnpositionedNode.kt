@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*

@JsExport
sealed interface UnpositionedNode : NodeCommon, WithOffsetInTree {
    fun withLabel(newLabel: NodeLabel): UnpositionedNode
}

@JsExport
data class UnpositionedBranchingNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val children: Set<Id>,
) : UnpositionedNode {
    @JsName("new")
    constructor(label: NodeLabel, offset: TreeCoordsOffset, children: Array<Id>) :
            this(label, offset, children.toSet())

    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedTerminalNode(
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
data class UnpositionedPlainStrandedNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedFormerlyTerminalNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerSlice: StringSlice,
    val formerlyTriangle: Boolean,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
data class UnpositionedFormerlyBranchingNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerDescendants: IdMap<UnpositionedNode>,
) : UnpositionedStrandedNode {
    override fun withLabel(newLabel: NodeLabel) = copy(label = newLabel)

    override fun withOffset(newOffset: TreeCoordsOffset) = copy(offset = newOffset)
}

@JsExport
fun isBranching(node: UnpositionedNode) = node is UnpositionedBranchingNode

@JsExport
fun isTerminal(node: UnpositionedNode) = node is UnpositionedTerminalNode

@JsExport
fun isFormerlyBranching(node: UnpositionedNode) = node is UnpositionedFormerlyBranchingNode

@JsExport
fun isFormerlyTerminal(node: UnpositionedNode) = node is UnpositionedFormerlyTerminalNode
