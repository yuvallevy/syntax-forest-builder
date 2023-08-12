package ui

import content.NodeIndicatorInPlot
import content.StringSlice
import content.positioned.*
import content.unpositioned.*
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFalse
import kotlin.test.assertTrue

class SelectionTest {
    private val plot = UnpositionedPlot(
        trees = mapOf(
            "YC38BV4q" to UnpositionedTree(
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "kgzt" to UnpositionedBranchingNode("VP", TreeCoordsOffset(0.0, -10.0), setOf("aF3BLs", "X9M")),
                    "aF3BLs" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    "X9M" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18), triangle = true),
                ),
                offset = PlotCoordsOffset(30.0, -10.0),
            )
        )
    )

    private val positionedPlot = PositionedPlot(
        trees = mapOf(
            "YC38BV4q" to PositionedTree(
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "kgzt" to PositionedBranchingNode("VP", CoordsInTree(77.5, -70.0), setOf("aF3BLs", "X9M")),
                    "aF3BLs" to PositionedTerminalNode("V", CoordsInTree(54.0, -2.0), StringSlice(5, 10), null),
                    "X9M" to PositionedTerminalNode("NP", CoordsInTree(101.0, -20.0), StringSlice(11, 18),
                        TreeXRange(77.0, 125.0)),
                ),
                position = CoordsInPlot(30.0, -10.0),
                width = 129.0,
            )
        )
    )

    @Test
    fun setNewSelection() =
        assertEquals(
            setOf(
                NodeIndicatorInPlot("j1w", "GK91"),
                NodeIndicatorInPlot("83g", "07f7"),
            ),
            applySelection(
                NodeSelectionMode.SetSelection,
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
                emptySet()
            )
        )

    @Test
    fun setNewSelectionInsteadOfExisting() =
        assertEquals(
            setOf(NodeIndicatorInPlot("j1w", "GK91")),
            applySelection(
                NodeSelectionMode.SetSelection,
                setOf(NodeIndicatorInPlot("j1w", "GK91")),
                setOf(
                    NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                    NodeIndicatorInPlot("sS6", "t68q"),
                )
            )
        )

    @Test
    fun addToEmptySelection() =
        assertEquals(
            setOf(
                NodeIndicatorInPlot("j1w", "GK91"),
                NodeIndicatorInPlot("83g", "07f7"),
            ),
            applySelection(
                NodeSelectionMode.AddToSelection,
                setOf(
                    NodeIndicatorInPlot("j1w", "GK91"),
                    NodeIndicatorInPlot("83g", "07f7"),
                ),
                emptySet()
            )
        )

    @Test
    fun addToExistingSelection() =
        assertEquals(
            setOf(
                NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                NodeIndicatorInPlot("sS6", "t68q"),
                NodeIndicatorInPlot("j1w", "GK91"),
            ),
            applySelection(
                NodeSelectionMode.AddToSelection,
                setOf(NodeIndicatorInPlot("j1w", "GK91")),
                setOf(
                    NodeIndicatorInPlot("m7R3yc", "AwtAG6y"),
                    NodeIndicatorInPlot("sS6", "t68q"),
                )
            )
        )

    @Test
    fun pruneSelectionAfterNothingDeleted() =
        assertEquals(
            NodeSelectionInPlot(setOf(
                NodeIndicatorInPlot("YC38BV4q", "kgzt"),
                NodeIndicatorInPlot("YC38BV4q", "aF3BLs"),
            )),
            pruneSelection(
                NodeSelectionInPlot(setOf(
                    NodeIndicatorInPlot("YC38BV4q", "kgzt"),
                    NodeIndicatorInPlot("YC38BV4q", "aF3BLs"),
                )),
                plot
            )
        )

    @Test
    fun pruneSelectionAfterOneNodeDeleted() =
        assertEquals(
            NodeSelectionInPlot(setOf(
                NodeIndicatorInPlot("YC38BV4q", "kgzt"),
            )),
            pruneSelection(
                NodeSelectionInPlot(setOf(
                    NodeIndicatorInPlot("YC38BV4q", "kgzt"),
                    NodeIndicatorInPlot("YC38BV4q", "O5Jowkc"),
                )),
                plot
            )
        )

    @Test
    fun pruneSelectionAfterAllSelectedNodesDeleted() =
        assertEquals(
            NodeSelectionInPlot(emptySet()),
            pruneSelection(
                NodeSelectionInPlot(setOf(
                    NodeIndicatorInPlot("YC38BV4q", "c97Tes"),
                    NodeIndicatorInPlot("YC38BV4q", "O5Jowkc"),
                )),
                plot
            )
        )

    @Test
    fun isNodeInRectTrue() =
        assertTrue(
            isNodeInRect(
                positionedPlot.tree("YC38BV4q"),
                positionedPlot.tree("YC38BV4q").node("aF3BLs"),
                PlotRect(CoordsInPlot(78.0, -27.0), CoordsInPlot(90.0, -12.0))
            )
        )

    @Test
    fun isNodeInRectFalse() =
        assertFalse(
            isNodeInRect(
                positionedPlot.tree("YC38BV4q"),
                positionedPlot.tree("YC38BV4q").node("X9M"),
                PlotRect(CoordsInPlot(80.0, -28.0), CoordsInPlot(95.0, -10.0))
            )
        )
}
