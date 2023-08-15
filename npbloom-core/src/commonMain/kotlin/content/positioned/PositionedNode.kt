@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.*

typealias PlotX = Double
typealias PlotY = Double
typealias TreeX = Double
typealias TreeY = Double
typealias Width = Double

@JsExport
sealed interface PositionedNode : NodeCommon, WithPositionInTree

@JsExport
data class PositionedBranchingNode(
    override val id: Id,
    override val label: NodeLabel,
    override val position: CoordsInTree,
    internal val children: Set<Id> = emptySet(),
) : PositionedNode {
    val childrenAsArray = children.toTypedArray()

    fun withChildrenFromArray(children: Array<Id>) =
        copy(id = id, label = label, position = position, children = children.toSet())
}

@JsExport
data class PositionedTerminalNode(
    override val id: Id,
    override val label: NodeLabel,
    override val position: CoordsInTree,
    val slice: StringSlice,
    val triangle: TreeXRange? = null,
) : PositionedNode

@JsExport
data class PositionedStrandedNode(
    override val id: Id,
    override val label: NodeLabel,
    override val position: CoordsInTree,
) : PositionedNode
