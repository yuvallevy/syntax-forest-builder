package content.positioned

import content.EntitySet
import content.StringSlice
import kotlin.test.*

class PositionedTreeTest {
    private val tree = PositionedTree(
        id = "218qL3a",
        sentence = "Noun verbs very adverbly.",
        nodes = EntitySet(
            PositionedBranchingNode("a", "S", CoordsInTree(53.625, -80.0), setOf("b")),
            PositionedBranchingNode("b", "NP", CoordsInTree(18.0, -60.0), setOf("c")),
            PositionedTerminalNode("c", "N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
            PositionedBranchingNode("d", "VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            PositionedTerminalNode("e", "V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            PositionedTerminalNode( "f", "AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24),
                TreeXRange(72.0, 104.0)),
        ),
        position = CoordsInPlot(50.0, -32.0),
        width = 104.0,
    )

    private val treeWithoutSNode = PositionedTree(
        id = "218qL3a",
        sentence = "Noun verbs very adverbly.",
        nodes = EntitySet(
            PositionedBranchingNode("b", "NP", CoordsInTree(18.0, -60.0), setOf("c")),
            PositionedTerminalNode("c", "N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
            PositionedBranchingNode("d", "VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
            PositionedTerminalNode("e", "V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            PositionedTerminalNode( "f", "AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24),
                TreeXRange(72.0, 104.0)),
        ),
        position = CoordsInPlot(50.0, -32.0),
        width = 104.0,
    )

    private val treeWithoutVPNodeAndConnections = PositionedTree(
        id = "218qL3a",
        sentence = "Noun verbs very adverbly.",
        nodes = EntitySet(
            PositionedBranchingNode("b", "NP", CoordsInTree(18.0, -60.0), setOf("c")),
            PositionedTerminalNode("c", "N", CoordsInTree(18.0, -2.0), StringSlice(0, 4)),
        ),
        position = CoordsInPlot(50.0, -32.0),
        width = 104.0,
    )

    @Test
    fun filterByTrianglehoodPredicate() =
        assertEquals(
            EntitySet<PositionedNode>(
                PositionedTerminalNode( "f", "AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24),
                    TreeXRange(72.0, 104.0))
            ),
            tree.filterNodes { it is PositionedTerminalNode && it.triangle != null }
        )

    @Test
    fun filterByPhrasePredicate() =
        assertEquals(
            EntitySet(
                PositionedBranchingNode("b", "NP", CoordsInTree(18.0, -60.0), setOf("c")),
                PositionedBranchingNode("d", "VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
                PositionedTerminalNode( "f", "AdvP", CoordsInTree(121.5, -30.0), StringSlice(11, 24),
                    TreeXRange(72.0, 104.0)),
            ),
            tree.filterNodes { """^\w+P${'$'}""".toRegex() matches it.label }
        )

    @Test
    fun filterNodesByIds() =
        assertEquals(
            EntitySet(
                PositionedBranchingNode("a", "S", CoordsInTree(53.625, -80.0), setOf("b")),
                PositionedTerminalNode("e", "V", CoordsInTree(57.0, -2.0), StringSlice(5, 10)),
            ),
            tree.filterNodesById(setOf("a", "e"))
        )

    @Test
    fun getTopLevelNodes() =
        assertEquals(
            EntitySet<PositionedNode>(
                PositionedBranchingNode("b", "NP", CoordsInTree(18.0, -60.0), setOf("c")),
                PositionedBranchingNode("d", "VP", CoordsInTree(89.25, -60.0), setOf("e", "f")),
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
