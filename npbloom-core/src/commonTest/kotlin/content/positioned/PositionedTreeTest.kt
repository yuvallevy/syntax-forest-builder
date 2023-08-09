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

    private val treeWithoutVPNodeAndConnections = PositionedTree(
        sentence = "Noun verbs very adverbly.",
        nodes = mapOf(
            "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
            "c" to PositionedTerminalNode("N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
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
            tree.filterNodes { it is PositionedTerminalNode && it.triangle != null }
        )

    @Test
    fun filterByPhrasePredicate() =
        assertEquals(
            mapOf(
                "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
                "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
                "f" to PositionedTerminalNode("AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24), TreeXRange(72.0, 104.0)),
            ),
            tree.filterNodes { """^\w+P${'$'}""".toRegex() matches it.label }
        )

    @Test
    fun filterNodesByIds() =
        assertEquals(
            mapOf(
                "a" to PositionedBranchingNode("S", CoordsInTree(53.625, -80.0), setOf("b")),
                "e" to PositionedTerminalNode("V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            ),
            tree.filterNodesById(setOf("a", "e"))
        )

    @Test
    fun getTopLevelNodes() =
        assertEquals(
            mapOf(
                "b" to PositionedBranchingNode("NP", CoordsInTree(18.0, -60.0), setOf("c")),
                "d" to PositionedBranchingNode("VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            ),
            treeWithoutSNode.getTopLevelNodes()
        )

    @Test
    fun sortNodesByXCoord() =
        assertContentEquals(arrayOf("b", "c", "a", "e"), tree.sortNodesByXCoord(setOf("a", "b", "c", "e")))

    @Test
    fun checkIfSliceUnassigned() {
        assertFalse(tree.isSliceUnassigned(StringSlice(0, 4)))
        assertFalse(tree.isSliceUnassigned(StringSlice(5, 10)))
        assertFalse(tree.isSliceUnassigned(StringSlice(3, 6)))
        assertFalse(treeWithoutVPNodeAndConnections.isSliceUnassigned(StringSlice(0, 4)))
        assertTrue(treeWithoutVPNodeAndConnections.isSliceUnassigned(StringSlice(5, 10)))
        assertFalse(treeWithoutVPNodeAndConnections.isSliceUnassigned(StringSlice(3, 6)))
    }
}
