package content.positioned

import content.StringSlice
import kotlin.test.*

class PositionedTreeTest {
    private val tree = PositionedTree(
        sentence = "Noun verbs very adverbly.",
        nodes = mapOf(
            "a" to PositionedBranchingNode("S", CoordsInTree(53.625, -80.0), setOf("b")),
            "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
            "c" to PositionedTerminalNode("N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
            "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            "e" to PositionedTerminalNode("V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            "f" to PositionedTerminalNode("AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24), TreeXRange(72.0, 104.0)),
        ),
        position = CoordsInPlot(50.0, -32.0),
        width = 104.0,
    )

    private val treeWithoutSNode = PositionedTree(
        sentence = "Noun verbs very adverbly.",
        nodes = mapOf(
            "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
            "c" to PositionedTerminalNode("N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
            "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            "e" to PositionedTerminalNode("V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            "f" to PositionedTerminalNode("AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24), TreeXRange(72.0, 104.0)),
        ),
        position = CoordsInPlot(50.0, -32.0),
        width = 104.0,
    )

    @Test
    fun filterByTrianglehoodPredicate() =
        assertEquals(
            mapOf(
                "f" to PositionedTerminalNode("AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24), TreeXRange(72.0, 104.0))
            ),
            filterPositionedNodesInTree({ it is PositionedTerminalNode && it.triangle != null }, tree)
        )

    @Test
    fun filterByPhrasePredicate() =
        assertEquals(
            mapOf(
                "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
                "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
                "f" to PositionedTerminalNode("AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24), TreeXRange(72.0, 104.0)),
            ),
            filterPositionedNodesInTree({ """^\w+P${'$'}""".toRegex() matches it.label }, tree)
        )

    @Test
    fun filterNodesByIds() =
        assertEquals(
            mapOf(
                "a" to PositionedBranchingNode("S", CoordsInTree(53.625, -80.0), setOf("b")),
                "e" to PositionedTerminalNode("V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            ),
            filterPositionedNodesInTreeById(setOf("a", "e"), tree)
        )

    @Test
    fun determineWhetherTopLevel() {
        assertTrue(isTopLevel(tree.nodes, "a"))
        assertFalse(isTopLevel(tree.nodes, "b"))
        assertFalse(isTopLevel(tree.nodes, "c"))
        assertTrue(isTopLevel(tree.nodes, "d"))
        assertFalse(isTopLevel(tree.nodes, "e"))
        assertFalse(isTopLevel(tree.nodes, "f"))
    }

    @Test
    fun getTopLevelNodes() =
        assertEquals(
            mapOf(
                "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
                "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            ),
            getTopLevelPositionedNodes(treeWithoutSNode)
        )

    @Test
    fun sortNodesByXCoord() =
        assertContentEquals(arrayOf("b", "c", "a", "e"), sortPositionedNodesByXCoord(tree, setOf("a", "b", "c", "e")))
}