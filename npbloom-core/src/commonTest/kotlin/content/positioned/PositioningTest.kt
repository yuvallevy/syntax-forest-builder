package content.positioned

import content.EntitySet
import content.StringSlice
import content.YAlignMode
import content.unpositioned.*
import mockStrWidth
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class PositioningTest {
    private val treeWithTerminalNodes = UnpositionedTree(
        id = "O29",
        sentence = "Noun verbs.",
        nodes = EntitySet(
            UnpositionedTerminalNode("a", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedTerminalNode("b", "V", TreeCoordsOffset(5.0, 0.0), StringSlice(5, 10)),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithTriangleNodes = UnpositionedTree(
        id = "oqYi7",
        sentence = "Noun verb phrases.",
        nodes = EntitySet(
            UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, -10.0), StringSlice(0, 4)),
            UnpositionedTerminalNode("b", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 17), true),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithStrandedNodes = UnpositionedTree(
        id = "7NI69oA",
        sentence = "Noun verbs.",
        nodes = EntitySet(
            UnpositionedFormerlyBranchingNode("c", "S", TreeCoordsOffset.ZERO, treeWithTerminalNodes.nodes),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithBranchingNodes = UnpositionedTree(
        id = "BJcX",
        sentence = "Noun verbs.",
        nodes = EntitySet(
            UnpositionedTerminalNode("a", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedTerminalNode("b", "V", TreeCoordsOffset(5.0, 0.0), StringSlice(5, 10)),
            UnpositionedBranchingNode("c", "S", TreeCoordsOffset.ZERO, setOf("a", "b")),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithBranchingAndTriangleNodes = UnpositionedTree(
        id = "926mr",
        sentence = "Noun verb phrases.",
        nodes = EntitySet(
            UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, -10.0), StringSlice(0, 4)),
            UnpositionedTerminalNode("b", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 17), true),
            UnpositionedBranchingNode("c", "S", TreeCoordsOffset.ZERO, setOf("a", "b")),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithVerticallyAlignedNode = UnpositionedTree(
        id = "926mr",
        sentence = "Noun verbs.",
        nodes = EntitySet(
            UnpositionedTerminalNode("a", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), yAlignMode = YAlignMode.Top),
            UnpositionedTerminalNode("d", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
            UnpositionedBranchingNode("b", "VP", TreeCoordsOffset.ZERO, setOf("d")),
            UnpositionedBranchingNode("c", "S", TreeCoordsOffset.ZERO, setOf("a", "b")),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    @Test
    fun positionTerminalNodes() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithTerminalNodes)
        assertEquals(CoordsInTree(18.0, -2.0), result.node("a").position)
        assertEquals(CoordsInTree(62.0, -2.0), result.node("b").position)
    }

    @Test
    fun positionTriangleNodes() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithTriangleNodes)
        assertEquals(CoordsInTree(18.0, -12.0), result.node("a").position)
        assertEquals(CoordsInTree(79.5, -20.0), result.node("b").position)
    }

    @Test
    fun positionStrandedNodes() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithStrandedNodes)
        assertEquals(CoordsInTree(40.0, -42.0), result.node("c").position)
    }

    @Test
    fun positionBranchingNodes() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithBranchingNodes)
        assertEquals(CoordsInTree(40.0, -42.0), result.node("c").position)
    }

    @Test
    fun positionBranchingNodesInTreeWithTriangles() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithBranchingAndTriangleNodes)
        assertEquals(CoordsInTree(48.75, -60.0), result.node("c").position)
    }

    @Test
    fun positionTriangleVertices() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithTriangleNodes)
        val triangleNode = result.nodes["b"] as PositionedTerminalNode
        assertEquals(TreeXRange(40.0, 119.0), triangleNode.triangle)
    }

    @Test
    fun positionVerticallyAlignedNodes() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithVerticallyAlignedNode)
        assertEquals(CoordsInTree(18.0, -42.0), result.node("a").position)
    }

    @Test
    fun sortNodesByXCoord() {
        assertContentEquals(
            arrayOf("a", "b"),
            sortNodesByXCoord(::mockStrWidth, treeWithBranchingNodes, setOf("b", "a"))
        )
        assertContentEquals(
            arrayOf("a", "c"),
            sortNodesByXCoord(::mockStrWidth, treeWithBranchingNodes, setOf("a", "c"))
        )
    }

    @Test
    fun measureTreeWidth() {
        val result = applyNodePositionsToTree(::mockStrWidth, treeWithBranchingAndTriangleNodes)
        assertEquals(123.0, result.width)
    }
}
