package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.NodeIndicatorInPlot
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.*
import space.yuvalinguist.npbloom.content.unpositioned.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SelectionTest {
    private val plot = UnpositionedPlot(
        trees = EntitySet(
            UnpositionedTree(
                id = "YC38BV4q",
                sentence = "Alex baked cookies.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("kgzt", "VP", TreeCoordsOffset(0.0, -10.0), setOf("aF3BLs", "X9M")),
                    UnpositionedTerminalNode("aF3BLs", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    UnpositionedTerminalNode("X9M", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18), triangle = true),
                ),
                offset = PlotCoordsOffset(30.0, -10.0),
            )
        )
    )

    private val positionedPlot = PositionedPlot(
        trees = EntitySet(
            PositionedTree(
                id = "YC38BV4q",
                sentence = "Alex baked cookies.",
                nodes = EntitySet(
                    PositionedBranchingNode("kgzt", "VP", CoordsInTree(77.5, -70.0), setOf("aF3BLs", "X9M")),
                    PositionedTerminalNode("aF3BLs", "V", CoordsInTree(54.0, -2.0), StringSlice(5, 10), null),
                    PositionedTerminalNode("X9M", "NP", CoordsInTree(101.0, -20.0), StringSlice(11, 18),
                        TreeXRange(77.0, 125.0)),
                ),
                position = CoordsInPlot(30.0, -10.0),
                width = 129.0,
            )
        )
    )

    @Test
    fun setNewNodeSelection() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
            ),
            applyNodeSelection(
                EntitySelectionMode.SetSelection,
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
                emptySet()
            )
        )

    @Test
    fun setNewNodeSelectionToEmpty() =
        assertEquals(
            NoSelectionInPlot,
            applyNodeSelection(
                EntitySelectionMode.SetSelection,
                emptySet(),
                emptySet(),
            )
        )

    @Test
    fun setNewNodeSelectionInsteadOfExisting() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(NodeIndicatorInPlot("j1w", "GK91")),
            ),
            applyNodeSelection(
                EntitySelectionMode.SetSelection,
                setOf(NodeIndicatorInPlot("j1w", "GK91")),
                setOf(
                    NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                    NodeIndicatorInPlot("sS6", "t68q"),
                )
            )
        )

    @Test
    fun addToEmptyNodeSelection() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
            ),
            applyNodeSelection(
                EntitySelectionMode.AddToSelection,
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
                emptySet()
            )
        )

    @Test
    fun addToExistingNodeSelection() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(
                    NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                    NodeIndicatorInPlot("sS6", "t68q"),
                    NodeIndicatorInPlot("j1w", "GK91"),
                ),
            ),
            applyNodeSelection(
                EntitySelectionMode.AddToSelection,
                setOf(NodeIndicatorInPlot("j1w", "GK91")),
                setOf(
                    NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                    NodeIndicatorInPlot("sS6", "t68q"),
                )
            )
        )

    @Test
    fun setNewTreeSelection() =
        assertEquals(
            TreeSelectionInPlot(setOf("j1w", "83g")),
            applyTreeSelection(EntitySelectionMode.SetSelection, setOf("j1w", "83g"), emptySet())
        )

    @Test
    fun setNewTreeSelectionToEmpty() =
        assertEquals(
            NoSelectionInPlot,
            applyTreeSelection(EntitySelectionMode.SetSelection, emptySet(), emptySet())
        )

    @Test
    fun setNewTreeSelectionInsteadOfExisting() =
        assertEquals(
            TreeSelectionInPlot(setOf("j1w")),
            applyTreeSelection(EntitySelectionMode.SetSelection, setOf("j1w"), setOf("m7R3yc", "sS6"))
        )

    @Test
    fun addToEmptyTreeSelection() =
        assertEquals(
            TreeSelectionInPlot(setOf("j1w", "83g")),
            applyTreeSelection(EntitySelectionMode.AddToSelection, setOf("j1w", "83g"), emptySet())
        )

    @Test
    fun addToExistingTreeSelection() =
        assertEquals(
            TreeSelectionInPlot(setOf("m7R3yc", "sS6", "j1w")),
            applyTreeSelection(EntitySelectionMode.AddToSelection, setOf("j1w"), setOf("m7R3yc", "sS6"))
        )

    @Test
    fun pruneNodeSelectionAfterNothingDeleted() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(NodeIndicatorInPlot("YC38BV4q", "kgzt"), NodeIndicatorInPlot("YC38BV4q", "aF3BLs"))
            ),
            pruneSelection(
                NodeSelectionInPlot(
                    setOf(NodeIndicatorInPlot("YC38BV4q", "kgzt"), NodeIndicatorInPlot("YC38BV4q", "aF3BLs"))
                ),
                plot
            )
        )

    @Test
    fun pruneNodeSelectionAfterOneNodeDeleted() =
        assertEquals(
            NodeSelectionInPlot(
                setOf(NodeIndicatorInPlot("YC38BV4q", "kgzt"))
            ),
            pruneSelection(
                NodeSelectionInPlot(
                    setOf(NodeIndicatorInPlot("YC38BV4q", "kgzt"), NodeIndicatorInPlot("YC38BV4q", "O5Jowkc"))
                ),
                plot
            )
        )

    @Test
    fun pruneNodeSelectionAfterAllSelectedNodesDeleted() =
        assertEquals(
            NoSelectionInPlot,
            pruneSelection(
                NodeSelectionInPlot(
                    setOf(NodeIndicatorInPlot("YC38BV4q", "c97Tes"), NodeIndicatorInPlot("YC38BV4q", "O5Jowkc"))
                ),
                plot
            )
        )

    @Test
    fun isNodeInRectTrue() =
        assertTrue(
            isNodeInRect(
                positionedPlot.tree("YC38BV4q"),
                positionedPlot.tree("YC38BV4q").node("aF3BLs"),
                RectInPlot(CoordsInPlot(78.0, -27.0), CoordsInPlot(90.0, -12.0))
            )
        )

    @Test
    fun isNodeInRectFalse() =
        assertFalse(
            isNodeInRect(
                positionedPlot.tree("YC38BV4q"),
                positionedPlot.tree("YC38BV4q").node("X9M"),
                RectInPlot(CoordsInPlot(80.0, -28.0), CoordsInPlot(95.0, -10.0))
            )
        )
}
