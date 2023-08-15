package ui.content

import content.EntitySet
import content.NodeIndicatorInPlot
import content.StringSlice
import content.unpositioned.*
import kotlin.test.Test
import kotlin.test.assertEquals

class ContentStateTest {
    private val testInitialState = ContentState(
        plots = arrayOf(
            UnpositionedPlot(
                trees = EntitySet(
                    UnpositionedTree(
                        id = "aa",
                        sentence = "tree state",
                        nodes = EntitySet(
                            UnpositionedTerminalNode("a", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedTerminalNode("b", "N", TreeCoordsOffset(1.0, 10.0), StringSlice(5, 10)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                    UnpositionedTree(
                        id = "zz",
                        sentence = "nodes rock",
                        nodes = EntitySet(
                            UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                            UnpositionedTerminalNode("x", "N", TreeCoordsOffset(1.0, 8.0), StringSlice(0, 5)),
                            UnpositionedTerminalNode("y", "V", TreeCoordsOffset.ZERO, StringSlice(6, 10)),
                        ),
                        offset = PlotCoordsOffset(60.0, 0.0),
                    ),
                ),
            ),
            UnpositionedPlot(
                trees = EntitySet(
                    UnpositionedTree(
                        id = "aa",
                        sentence = "syntax is fun",
                        nodes = EntitySet(
                            UnpositionedTerminalNode("a", "N", TreeCoordsOffset.ZERO, StringSlice(0, 6)),
                            UnpositionedTerminalNode("b", "VP", TreeCoordsOffset(1.0, 10.0), StringSlice(7, 13),
                                triangle = true),
                        ),
                        offset = PlotCoordsOffset(20.0, 10.0),
                    ),
                ),
            ),
        ),
    )

    private val testInitialContentState = initialContentState.copy(
        current = testInitialState,
        undoStack = arrayOf(
            PlotChanged(
                1,
                testInitialState.plots[1],
                UnpositionedPlot(
                    trees = EntitySet(
                        UnpositionedTree(
                            id = "aa",
                            sentence = "syntax is fun",
                            nodes = EntitySet(
                                UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, -5.0), StringSlice(0, 6)),
                                testInitialState.plots[1].tree("aa").node("b"),
                            ),
                            offset = PlotCoordsOffset(20.0, 10.0),
                        ),
                    ),
                ),
            ),
        ),
    )

    private fun assertActionResult(
        action: ContentOrHistoryAction,
        current: ContentState,
        newUndoableAction: ContentChange? = null,
        undoStack: Array<ContentChange> = testInitialContentState.undoStack,
        redoStack: Array<ContentChange> = testInitialContentState.redoStack,
    ) = assertEquals(
        testInitialContentState.copy(
            current = current,
            undoStack = if (newUndoableAction != null) arrayOf(newUndoableAction) + undoStack else undoStack,
            redoStack = redoStack,
        ),
        contentReducer(testInitialContentState, action)
    )

    @Test
    fun addPlot() =
        assertActionResult(
            action = AddPlot,
            current = ContentState(plots = testInitialState.plots + arrayOf(UnpositionedPlot())),
            newUndoableAction = PlotAdded(newPlotIndex = 2, newPlot = UnpositionedPlot()),
        )

    @Test
    fun deletePlot() =
        assertActionResult(
            action = DeletePlot(1),
            current = ContentState(plots = arrayOf(testInitialState.plots[0])),
            newUndoableAction = PlotDeleted(plotIndex = 1, removedPlot = testInitialState.plots[1]),
        )

    @Test
    fun resetPlot() =
        assertActionResult(
            action = ResetPlot(0),
            current = ContentState(plots = arrayOf(UnpositionedPlot(), testInitialState.plots[1])),
            newUndoableAction = PlotChanged(plotIndex = 0, old = testInitialState.plots[0], new = UnpositionedPlot()),
        )

    @Test
    fun insertNode() =
        assertActionResult(
            action = InsertNode(1, "aa", InsertedBranchingNode("c", "NP", null, setOf("a"))),
            current = ContentState(
                plots = arrayOf(
                    testInitialState.plots[0],
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "syntax is fun",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 6),
                                        false),
                                    UnpositionedTerminalNode("b", "VP", TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(7, 13), true),
                                    UnpositionedBranchingNode("c", "NP", TreeCoordsOffset(0.0, 0.0), setOf("a")),
                                ),
                                offset = PlotCoordsOffset(20.0, 10.0),
                            ),
                        ),
                    ),
                ),
            ),
            newUndoableAction = TreeChanged(
                plotIndex = 1,
                old = testInitialState.plots[1].tree("aa"),
                new = UnpositionedTree(
                    id = "aa",
                    sentence = "syntax is fun",
                    nodes = EntitySet(
                        UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 6), false),
                        UnpositionedTerminalNode("b", "VP", TreeCoordsOffset(1.0, 10.0), StringSlice(7, 13), true),
                        UnpositionedBranchingNode("c", "NP", TreeCoordsOffset(0.0, 0.0), setOf("a")),
                    ),
                    offset = PlotCoordsOffset(20.0, 10.0),
                )
            ),
        )

    @Test
    fun deleteNodes() =
        assertActionResult(
            action = DeleteNodes(0, setOf(NodeIndicatorInPlot("aa", "b"), NodeIndicatorInPlot("zz", "x"))),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedFormerlyBranchingNode(
                                        "w",
                                        "NP", TreeCoordsOffset(-1.0, 5.0), EntitySet(
                                            UnpositionedTerminalNode(
                                                "x",
                                                "N",
                                                TreeCoordsOffset(1.0, 8.0),
                                                StringSlice(0, 5),
                                                false
                                            ),
                                        )
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = PlotChanged(
                plotIndex = 0,
                old = testInitialState.plots[0],
                new = UnpositionedPlot(
                    trees = EntitySet(
                        UnpositionedTree(
                            id = "aa",
                            sentence = "tree state",
                            nodes = EntitySet(
                                UnpositionedTerminalNode(
                                    "a",
                                    "N",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(0, 4),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(0.0, 0.0),
                        ),
                        UnpositionedTree(
                            id = "zz",
                            sentence = "nodes rock",
                            nodes = EntitySet(
                                UnpositionedFormerlyBranchingNode(
                                    "w",
                                    "NP", TreeCoordsOffset(-1.0, 5.0), EntitySet(
                                        UnpositionedTerminalNode(
                                            "x",
                                            "N",
                                            TreeCoordsOffset(1.0, 8.0),
                                            StringSlice(0, 5),
                                            false
                                        ),
                                    )
                                ),
                                UnpositionedTerminalNode(
                                    "y",
                                    "V",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(6, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(60.0, 0.0),
                        ),
                    )
                )
            ),
        )

    @Test
    fun adoptNodes() =
        assertActionResult(
            action = AdoptNodes(0, "zz", "x", setOf("y")),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedBranchingNode("x", "N", TreeCoordsOffset(0.0, 0.0), setOf("y")),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = TreeChanged(
                plotIndex = 0,
                old = testInitialState.plots[0].tree("zz"),
                new = UnpositionedTree(
                    id = "zz",
                    sentence = "nodes rock",
                    nodes = EntitySet(
                        UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                        UnpositionedBranchingNode("x", "N", TreeCoordsOffset(0.0, 0.0), setOf("y")),
                        UnpositionedTerminalNode("y", "V", TreeCoordsOffset(0.0, 0.0), StringSlice(6, 10), false),
                    ),
                    offset = PlotCoordsOffset(60.0, 0.0),
                )
            )
        )

    @Test
    fun disownNodes() =
        assertActionResult(
            action = DisownNodes(0, "zz", "w", setOf("x")),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedFormerlyBranchingNode(
                                        "w",
                                        "NP",
                                        TreeCoordsOffset(-1.0, 5.0),
                                        EntitySet(
                                            UnpositionedTerminalNode(
                                                "x",
                                                "N",
                                                TreeCoordsOffset(1.0, 8.0),
                                                StringSlice(0, 5),
                                                false
                                            )
                                        )
                                    ),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = TreeChanged(
                plotIndex = 0,
                old = testInitialState.plots[0].tree("zz"),
                new = UnpositionedTree(
                    id = "zz",
                    sentence = "nodes rock",
                    nodes = EntitySet(
                        UnpositionedFormerlyBranchingNode(
                            "w",
                            "NP",
                            TreeCoordsOffset(-1.0, 5.0),
                            EntitySet(
                                UnpositionedTerminalNode(
                                    "x",
                                    "N",
                                    TreeCoordsOffset(1.0, 8.0),
                                    StringSlice(0, 5),
                                    false
                                ),
                            )
                        ),
                        UnpositionedTerminalNode("x", "N", TreeCoordsOffset(1.0, 8.0), StringSlice(0, 5), false),
                        UnpositionedTerminalNode("y", "V", TreeCoordsOffset(0.0, 0.0), StringSlice(6, 10), false),
                    ),
                    offset = PlotCoordsOffset(60.0, 0.0),
                )
            ),
        )

    @Test
    fun moveNodes() =
        assertActionResult(
            action = MoveNodes(0, setOf(NodeIndicatorInPlot("aa", "a")), TreeCoordsOffset(1.0, -4.0)),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(1.0, -4.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = PlotChanged(
                plotIndex = 0,
                old = testInitialState.plots[0],
                new = UnpositionedPlot(
                    trees = EntitySet(
                        UnpositionedTree(
                            id = "aa",
                            sentence = "tree state",
                            nodes = EntitySet(
                                UnpositionedTerminalNode(
                                    "a",
                                    "N",
                                    TreeCoordsOffset(1.0, -4.0),
                                    StringSlice(0, 4),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "b",
                                    "N",
                                    TreeCoordsOffset(1.0, 10.0),
                                    StringSlice(5, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(0.0, 0.0),
                        ),
                        UnpositionedTree(
                            id = "zz",
                            sentence = "nodes rock",
                            nodes = EntitySet(
                                UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                UnpositionedTerminalNode(
                                    "x",
                                    "N",
                                    TreeCoordsOffset(1.0, 8.0),
                                    StringSlice(0, 5),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "y",
                                    "V",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(6, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(60.0, 0.0),
                        ),
                    )
                )
            ),
        )

    @Test
    fun resetNodePositions() =
        assertActionResult(
            action = ResetNodePositions(
                0,
                setOf(NodeIndicatorInPlot("aa", "b"), NodeIndicatorInPlot("zz", "w"))
            ),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(0.0, 0.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = PlotChanged(
                plotIndex = 0,
                old = testInitialState.plots[0],
                new = UnpositionedPlot(
                    trees = EntitySet(
                        UnpositionedTree(
                            id = "aa",
                            sentence = "tree state",
                            nodes = EntitySet(
                                UnpositionedTerminalNode(
                                    "a",
                                    "N",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(0, 4),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "b",
                                    "N",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(5, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(0.0, 0.0),
                        ),
                        UnpositionedTree(
                            id = "zz",
                            sentence = "nodes rock",
                            nodes = EntitySet(
                                UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(0.0, 0.0), setOf("x")),
                                UnpositionedTerminalNode(
                                    "x",
                                    "N",
                                    TreeCoordsOffset(1.0, 8.0),
                                    StringSlice(0, 5),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "y",
                                    "V",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(6, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(60.0, 0.0),
                        ),
                    )
                )
            ),
        )

    @Test
    fun setNodeLabel() =
        assertActionResult(
            action = SetNodeLabel(0, NodeIndicatorInPlot("aa", "a"), "NP"),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "NP",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = TreeChanged(
                plotIndex = 0,
                old = testInitialState.plots[0].tree("aa"),
                new = UnpositionedTree(
                    id = "aa",
                    sentence = "tree state",
                    nodes = EntitySet(
                        UnpositionedTerminalNode("a", "NP", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedTerminalNode("b", "N", TreeCoordsOffset(1.0, 10.0), StringSlice(5, 10), false),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                )
            ),
        )

    @Test
    fun setTriangle() =
        assertActionResult(
            action = SetTriangle(0, setOf(NodeIndicatorInPlot("aa", "b")), triangle = true),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        true
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = PlotChanged(
                plotIndex = 0,
                old = testInitialState.plots[0],
                new = UnpositionedPlot(
                    trees = EntitySet(
                        UnpositionedTree(
                            id = "aa",
                            sentence = "tree state",
                            nodes = EntitySet(
                                UnpositionedTerminalNode(
                                    "a",
                                    "N",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(0, 4),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "b",
                                    "N",
                                    TreeCoordsOffset(1.0, 10.0),
                                    StringSlice(5, 10),
                                    true
                                ),
                            ),
                            offset = PlotCoordsOffset(0.0, 0.0),
                        ),
                        UnpositionedTree(
                            id = "zz",
                            sentence = "nodes rock",
                            nodes = EntitySet(
                                UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                UnpositionedTerminalNode(
                                    "x",
                                    "N",
                                    TreeCoordsOffset(1.0, 8.0),
                                    StringSlice(0, 5),
                                    false
                                ),
                                UnpositionedTerminalNode(
                                    "y",
                                    "V",
                                    TreeCoordsOffset(0.0, 0.0),
                                    StringSlice(6, 10),
                                    false
                                ),
                            ),
                            offset = PlotCoordsOffset(60.0, 0.0),
                        ),
                    )
                )
            ),
        )

    @Test
    fun setSentence() =
        assertActionResult(
            action = SetSentence(0, "aa", "tee state", StringSlice(2, 2)),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tee state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 3),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(4, 9),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = TreeChanged(
                plotIndex = 0,
                old = testInitialState.plots[0].tree("aa"),
                new = UnpositionedTree(
                    id = "aa",
                    sentence = "tee state",
                    nodes = EntitySet(
                        UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 3), false),
                        UnpositionedTerminalNode("b", "N", TreeCoordsOffset(1.0, 10.0), StringSlice(4, 9), false),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                )
            )
        )

    @Test
    fun addTree() =
        assertActionResult(
            action = AddTree(0, "zz", PlotCoordsOffset(105.0, 88.0)),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "aa",
                                sentence = "tree state",
                                nodes = EntitySet(
                                    UnpositionedTerminalNode(
                                        "a",
                                        "N",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(0, 4),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "b",
                                        "N",
                                        TreeCoordsOffset(1.0, 10.0),
                                        StringSlice(5, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(0.0, 0.0),
                            ),
                            UnpositionedTree(
                                id = "zz",
                                sentence = "",
                                nodes = EntitySet(

                                ),
                                offset = PlotCoordsOffset(105.0, 88.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction =
            TreeAdded(
                plotIndex = 0, newTree = UnpositionedTree(
                    id = "zz",
                    sentence = "",
                    nodes = EntitySet(

                    ),
                    offset = PlotCoordsOffset(105.0, 88.0),
                )
            ),
        )

    @Test
    fun deleteTree() =
        assertActionResult(
            action = DeleteTree(0, "aa"),
            current = ContentState(
                plots = arrayOf(
                    UnpositionedPlot(
                        trees = EntitySet(
                            UnpositionedTree(
                                id = "zz",
                                sentence = "nodes rock",
                                nodes = EntitySet(
                                    UnpositionedBranchingNode("w", "NP", TreeCoordsOffset(-1.0, 5.0), setOf("x")),
                                    UnpositionedTerminalNode(
                                        "x",
                                        "N",
                                        TreeCoordsOffset(1.0, 8.0),
                                        StringSlice(0, 5),
                                        false
                                    ),
                                    UnpositionedTerminalNode(
                                        "y",
                                        "V",
                                        TreeCoordsOffset(0.0, 0.0),
                                        StringSlice(6, 10),
                                        false
                                    ),
                                ),
                                offset = PlotCoordsOffset(60.0, 0.0),
                            ),
                        )
                    ),
                    testInitialState.plots[1],
                )
            ),
            newUndoableAction = TreeDeleted(
                plotIndex = 0, removedTree = UnpositionedTree(
                    id = "aa",
                    sentence = "tree state",
                    nodes = EntitySet(
                        UnpositionedTerminalNode("a", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedTerminalNode(
                            "b",
                            "N",
                            TreeCoordsOffset(1.0, 10.0),
                            StringSlice(5, 10),
                            false
                        ),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                )
            ),
        )
}
