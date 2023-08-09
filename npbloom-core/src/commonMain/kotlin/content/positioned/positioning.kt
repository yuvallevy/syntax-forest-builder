@file:OptIn(ExperimentalJsExport::class)

package content.positioned

import content.Id
import content.IdMap
import content.Sentence
import content.StringSlice
import content.unpositioned.*

const val DEFAULT_TERMINAL_NODE_Y = -2.0
const val DEFAULT_TRIANGLE_NODE_Y = -20.0
const val DEFAULT_NODE_LEVEL_DIFF = -40.0

typealias StrWidthFunc = (str: String) -> Double

@JsExport
fun sliceOffsetAndWidth(strWidthFunc: StrWidthFunc, sentence: Sentence, slice: StringSlice): Array<Double> {
    val (sliceStart, sliceEndExclusive) = slice
    val widthBeforeSlice = strWidthFunc(sentence.slice(0 until sliceStart))
    val sliceWidth = strWidthFunc(sentence.slice(sliceStart until sliceEndExclusive))
    return arrayOf(widthBeforeSlice, sliceWidth)
}

@JsExport
fun determineNaturalParentNodePosition(childNodePositions: Set<CoordsInTree>): CoordsInTree =
    // Branching nodes are positioned as follows:
    // X - average of all X positions of its direct descendants (regardless of any descendants further down the tree)
    // Y - a certain distance above the topmost child node
    CoordsInTree(
        treeX = childNodePositions.map { it.treeX }.average(),
        treeY = childNodePositions.minOf { it.treeY } + DEFAULT_NODE_LEVEL_DIFF
    )

fun determineBranchingNodePosition(
    alreadyPositionedNodes: IdMap<PositionedNode>,
    node: UnpositionedBranchingNode,
): CoordsInTree {
    val positionedChildNodes = alreadyPositionedNodes.filterKeys { it in node.children }
    val naturalPosition =
        determineNaturalParentNodePosition(positionedChildNodes.mapValues { (_, node) -> node.position }.values.toSet())
    return CoordsInTree(
        treeX = naturalPosition.treeX + node.offset.dTreeX,
        treeY = naturalPosition.treeY + node.offset.dTreeY,
    )
}

fun determineTerminalNodePosition(strWidthFunc: StrWidthFunc, sentence: Sentence, node: UnpositionedTerminalNode): CoordsInTree {
    // Terminal nodes are positioned as follows:
    // X - exact center of the assigned slice, as measured in pixels
    // Y - a little above the slice if it is not a triangle node; a larger distance above the slice if it is
    val (widthBeforeSlice, sliceWidth) = sliceOffsetAndWidth(strWidthFunc, sentence, node.slice)
    return CoordsInTree(
        treeX = widthBeforeSlice + (sliceWidth / 2) + node.offset.dTreeX,
        treeY = (if (node.triangle) DEFAULT_TRIANGLE_NODE_Y else DEFAULT_TERMINAL_NODE_Y) + node.offset.dTreeY,
    )
}

fun determineTerminalNodeTriangleRange(
    strWidthFunc: StrWidthFunc,
    sentence: Sentence,
    node: UnpositionedTerminalNode,
): TreeXRange? =
    if (node.triangle) {
        val (widthBeforeSlice, sliceWidth) = sliceOffsetAndWidth(strWidthFunc, sentence, node.slice)
        TreeXRange(widthBeforeSlice, widthBeforeSlice + sliceWidth)
    } else null

@JsExport
fun determineStrandedNodePosition(
    strWidthFunc: StrWidthFunc,
    sentence: Sentence,
    node: UnpositionedStrandedNode
): CoordsInTree = when (node) {
    is UnpositionedFormerlyTerminalNode -> {  // Node was terminal - determine its position based on its slice
        val (widthBeforeSlice, sliceWidth) = sliceOffsetAndWidth(strWidthFunc, sentence, node.formerSlice)
        CoordsInTree(
            treeX = widthBeforeSlice + (sliceWidth / 2) + node.offset.dTreeX,
            treeY = (if (node.formerlyTriangle) DEFAULT_TRIANGLE_NODE_Y else DEFAULT_TERMINAL_NODE_Y) + node.offset.dTreeY,
        )
    }

    is UnpositionedFormerlyBranchingNode -> {  // Node was branching - determine its position based on past children
        val positionedChildNodes = applyNodePositions(node.formerDescendants, sentence, strWidthFunc)
        val childXs = positionedChildNodes.values.map { it.position.treeX }
        val childYs = positionedChildNodes.values.map { it.position.treeY }
        CoordsInTree(
            treeX = childXs.average() + node.offset.dTreeX,
            treeY = childYs.min() + DEFAULT_NODE_LEVEL_DIFF + node.offset.dTreeY,
        )
    }

    is UnpositionedPlainStrandedNode -> {  // Node was never anything other than stranded - just use its X and Y offset
        CoordsInTree(
            treeX = node.offset.dTreeX,
            treeY = node.offset.dTreeY,
        )
    }
}

/**
 * Returns the appropriate position for the given unpositioned node.
 */
@JsExport
fun determineNodePosition(
    alreadyPositionedNodes: IdMap<PositionedNode>,
    strWidthFunc: StrWidthFunc,
    sentence: Sentence,
    node: UnpositionedNode,
): CoordsInTree = when (node) {
    is UnpositionedBranchingNode -> determineBranchingNodePosition(alreadyPositionedNodes, node)
    is UnpositionedTerminalNode -> determineTerminalNodePosition(strWidthFunc, sentence, node)
    is UnpositionedStrandedNode -> determineStrandedNodePosition(strWidthFunc, sentence, node)
}

/**
 * Returns a positioned node corresponding to the given unpositioned node, based on already assigned node positions,
 * width calculation function and sentence associated with the tree.
 */
@JsExport
fun applyNodePosition(
    alreadyPositionedNodes: IdMap<PositionedNode>,
    strWidthFunc: StrWidthFunc,
    sentence: Sentence,
    node: UnpositionedNode,
): PositionedNode = when (node) {
    is UnpositionedBranchingNode -> PositionedBranchingNode(
        label = node.label, children = node.children,
        position = determineBranchingNodePosition(alreadyPositionedNodes, node),
    )
    is UnpositionedTerminalNode -> PositionedTerminalNode(
        label = node.label, slice = node.slice,
        triangle = determineTerminalNodeTriangleRange(strWidthFunc, sentence, node),
        position = determineTerminalNodePosition(strWidthFunc, sentence, node),
    )
    is UnpositionedStrandedNode -> PositionedStrandedNode(
        label = node.label,
        position = determineStrandedNodePosition(strWidthFunc, sentence, node),
    )
}

/**
 * Receives an ID map of unpositioned nodes and returns an equivalent map of nodes with assigned positions.
 * This function is recursive and progressively assigns positions to more and more nodes until the whole tree is filled.
 */
@JsExport
fun applyNodePositions(
    nodes: IdMap<UnpositionedNode>,
    sentence: Sentence,
    strWidthFunc: StrWidthFunc,
    alreadyPositionedNodes: IdMap<PositionedNode> = emptyMap(),
): IdMap<PositionedNode> {
    // If no unpositioned nodes are left, we're done
    if (nodes.isEmpty()) return alreadyPositionedNodes

    // Nodes that can be positioned at this point in the process are:
    // * Terminal nodes, whose position is entirely based on their assigned slice
    // * Stranded nodes, which internally store the descendants or slice that they once had
    // * Branching nodes whose children all have known positions
    val nodesToPositionNow = nodes.filterValues { unpositionedNode ->
        unpositionedNode !is UnpositionedBranchingNode || unpositionedNode.children.all { it in alreadyPositionedNodes }
    }

    // Assign positions to all the nodes we've determined to be ready for positioning
    val newPositionedNodes = nodesToPositionNow.mapValues { (_, node) ->
        applyNodePosition(alreadyPositionedNodes, strWidthFunc, sentence, node)
    }

    // All other nodes will be positioned in one of the next iterations
    val nodesToPositionNext = nodes.filterKeys { it !in nodesToPositionNow }

    // Repeat the process, using as unpositioned nodes only those nodes that are have not been assigned positions yet
    return applyNodePositions(nodesToPositionNext, sentence, strWidthFunc, alreadyPositionedNodes + newPositionedNodes)
}

/**
 * Returns a copy of the given tree with positions for all nodes.
 */
fun applyNodePositionsToTree(strWidthFunc: StrWidthFunc, tree: UnpositionedTree): PositionedTree = PositionedTree(
    sentence = tree.sentence,
    nodes = applyNodePositions(tree.nodes, tree.sentence, strWidthFunc),
    position = CoordsInPlot(tree.offset.dPlotX, tree.offset.dPlotY),
    width = strWidthFunc(tree.sentence),
)

/**
 * Returns a copy of the given plot with positions for all trees and nodes.
 */
@JsExport
fun applyNodePositionsToPlot(strWidthFunc: StrWidthFunc, plot: UnpositionedPlot): PositionedPlot =
    PositionedPlot(
        trees = plot.trees.mapValues { (_, node) -> applyNodePositionsToTree(strWidthFunc, node) },
    )

/**
 * Receives an array of node IDs in the given tree and returns them sorted by X-coordinate.
 */
@JsExport
fun sortNodesByXCoord(strWidthFunc: StrWidthFunc, tree: UnpositionedTree, nodeIds: Set<Id>): Array<Id> =
    applyNodePositionsToTree(strWidthFunc, tree).sortNodesByXCoord(nodeIds)