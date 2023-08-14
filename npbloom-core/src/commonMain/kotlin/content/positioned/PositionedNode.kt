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
data class PositionedBranchingNode internal constructor(
    override val label: NodeLabel,
    override val position: CoordsInTree,
    internal val children: Set<Id>,
) : PositionedNode {
    val childrenAsArray = children.toTypedArray()
}

@JsExport
data class PositionedTerminalNode internal constructor(
    override val label: NodeLabel,
    override val position: CoordsInTree,
    val slice: StringSlice,
    val triangle: TreeXRange? = null,
) : PositionedNode

@JsExport
data class PositionedStrandedNode internal constructor(
    override val label: NodeLabel,
    override val position: CoordsInTree,
) : PositionedNode
