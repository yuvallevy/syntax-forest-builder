@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.*

@JsExport
sealed interface UnpositionedNode : NodeCommon, WithOffsetInTree

@JsExport
data class UnpositionedBranchingNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val children: Set<Id>,
) : UnpositionedNode {
    @JsName("new")
    constructor(label: NodeLabel, offset: TreeCoordsOffset, children: Array<Id>) :
            this(label, offset, children.toSet())
}

@JsExport
data class UnpositionedTerminalNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val slice: StringSlice,
    val triangle: Boolean = false,
) : UnpositionedNode

@JsExport
sealed interface UnpositionedStrandedNode : UnpositionedNode

@JsExport
data class UnpositionedPlainStrandedNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
) : UnpositionedStrandedNode

@JsExport
data class UnpositionedFormerlyTerminalNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerSlice: StringSlice,
    val formerlyTriangle: Boolean,
) : UnpositionedStrandedNode

@JsExport
data class UnpositionedFormerlyBranchingNode(
    override val label: NodeLabel,
    override val offset: TreeCoordsOffset,
    val formerDescendants: IdMap<UnpositionedNode>,
) : UnpositionedStrandedNode

@JsExport
fun isBranching(node: UnpositionedNode) = node is UnpositionedBranchingNode

@JsExport
fun isTerminal(node: UnpositionedNode) = node is UnpositionedTerminalNode

@JsExport
fun isFormerlyBranching(node: UnpositionedNode) = node is UnpositionedFormerlyBranchingNode

@JsExport
fun isFormerlyTerminal(node: UnpositionedNode) = node is UnpositionedFormerlyTerminalNode
