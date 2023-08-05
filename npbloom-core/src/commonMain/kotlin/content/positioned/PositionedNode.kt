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
    override val label: NodeLabel,
    override val position: CoordsInTree,
    val children: Set<Id>,
) : PositionedNode

@JsExport
data class PositionedTerminalNode(
    override val label: NodeLabel,
    override val position: CoordsInTree,
    val slice: StringSlice,
    val triangle: TreeXRange? = null,
) : PositionedNode

@JsExport
data class PositionedStrandedNode(
    override val label: NodeLabel,
    override val position: CoordsInTree,
) : PositionedNode
