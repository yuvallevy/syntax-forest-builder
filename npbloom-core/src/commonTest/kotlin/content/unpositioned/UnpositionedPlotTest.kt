package content.unpositioned

import NoSuchTreeException
import content.IdMap
import content.NodeIndicatorInPlot
import content.StringSlice
import kotlin.test.*

class UnpositionedPlotTest {
    private val plot = UnpositionedPlot(
        trees = IdMap(
            UnpositionedTree(
                id = "cleo",
                sentence = "Cleo laughed.",
                nodes = IdMap(
                    UnpositionedBranchingNode("s1", "S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                    UnpositionedBranchingNode("np1", "NP", TreeCoordsOffset.ZERO, setOf("n1")),
                    UnpositionedTerminalNode("n1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    UnpositionedTerminalNode("vp1", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            UnpositionedTree(
                id = "alex",
                sentence = "Alex baked cookies.",
                nodes = IdMap(
                    UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                    UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                    UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                    UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
        ),
    )

    @Test
    fun isEmptyTrue() =
        assertTrue(UnpositionedPlot().isEmpty)

    @Test
    fun isEmptyFalse() =
        assertFalse(plot.isEmpty)

    @Test
    fun treesAsArray() =
        assertContentEquals(
            arrayOf(
                UnpositionedTree(
                    id = "cleo",
                    sentence = "Cleo laughed.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s1", "S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                        UnpositionedBranchingNode("np1", "NP", TreeCoordsOffset.ZERO, setOf("n1")),
                        UnpositionedTerminalNode("n1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                        UnpositionedTerminalNode("vp1", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                ), UnpositionedTree(
                    id = "alex",
                    sentence = "Alex baked cookies.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                        UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                        UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                        UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                        UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                        UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                )
            ), plot.treesAsArray
        )

    @Test
    fun treeCountZero() =
        assertEquals(0, UnpositionedPlot().treeCount)

    @Test
    fun treeCountNonzero() =
        assertEquals(2, plot.treeCount)

    @Test
    fun treeById() =
        assertEquals(
            UnpositionedTree(
                id = "alex",
                sentence = "Alex baked cookies.",
                nodes = IdMap(
                    UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                    UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                    UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                    UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            plot.tree("alex")
        )

    @Test
    fun treeByIdNonexistent() =
        assertFailsWith(NoSuchTreeException::class) {
            plot.tree("yona")
        }

    @Test
    fun plotContainsIdTrue() =
        assertTrue("cleo" in plot)

    @Test
    fun plotContainsIdFalse() =
        assertFalse("yona" in plot)

    @Test
    fun plotContainsIndicatorTrue() =
        assertTrue(NodeIndicatorInPlot("alex", "n2") in plot)

    @Test
    fun plotContainsIndicatorFalse() =
        assertFalse(NodeIndicatorInPlot("cleo", "n2") in plot)

    @Test
    fun setTree() =
        assertEquals(
            UnpositionedPlot(
                trees = IdMap(
                    UnpositionedTree(
                        id = "cleo",
                        sentence = "Cleo laughed.",
                        nodes = IdMap(
                            UnpositionedBranchingNode("s1", "S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                            UnpositionedBranchingNode("np1", "NP", TreeCoordsOffset.ZERO, setOf("n1")),
                            UnpositionedTerminalNode("n1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedTerminalNode("vp1", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                    UnpositionedTree(
                        id = "alex",
                        sentence = "Alex baked cookies.",
                        nodes = IdMap(
                            UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 8.0), setOf("np2a", "vp2")),
                            UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                            UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                            UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                            UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                ),
            ),
            plot.setTree(
                UnpositionedTree(
                    id = "alex",
                    sentence = "Alex baked cookies.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 8.0), setOf("np2a", "vp2")),
                        UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                        UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                        UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                        UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                        UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                )
            )
        )

    @Test
    fun removeTree() =
        assertEquals(
            UnpositionedPlot(
                trees = IdMap(
                    UnpositionedTree(
                        id = "alex",
                        sentence = "Alex baked cookies.",
                        nodes = IdMap(
                            UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                            UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                            UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                            UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                            UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                ),
            ),
            plot.removeTree("cleo")
        )

    @Test
    fun treeAndParentNodeIdOfNode() = assertEquals(
        setOf(NodeIndicatorInPlot("alex", "s2")),
        plot.getParentNodeIds(setOf(NodeIndicatorInPlot("alex", "vp2")))
    )

    @Test
    fun treeAndParentNodeIdOfTwoSiblingNodes() = assertEquals(
        setOf(NodeIndicatorInPlot("alex", "s2")),
        plot.getParentNodeIds(setOf(NodeIndicatorInPlot("alex", "np2a"), NodeIndicatorInPlot("alex", "vp2")))
    )

    @Test
    fun treeAndParentNodeIdOfTwoNonSiblingNodes() = assertEquals(
        setOf(NodeIndicatorInPlot("alex", "s2"), NodeIndicatorInPlot("alex", "np2a")),
        plot.getParentNodeIds(setOf(NodeIndicatorInPlot("alex", "np2a"), NodeIndicatorInPlot("alex", "n2")))
    )

    @Test
    fun noParentIdForTopLevelNode() = assertEquals(
        emptySet(),
        plot.getParentNodeIds(setOf(NodeIndicatorInPlot("alex", "s2")))
    )

    @Test
    fun treeAndParentNodeIdForTwoNodesIfOneTopLevel() = assertEquals(
        setOf(NodeIndicatorInPlot("alex", "np2a")),
        plot.getParentNodeIds(setOf(NodeIndicatorInPlot("alex", "s2"), NodeIndicatorInPlot("alex", "n2")))
    )

    @Test
    fun treeAndChildNodeIdOfNode() = assertEquals(
        setOf(NodeIndicatorInPlot("alex", "np2a"), NodeIndicatorInPlot("alex", "vp2")),
        plot.getChildNodeIds(setOf(NodeIndicatorInPlot("alex", "s2")))
    )

    @Test
    fun treeAndChildNodeIdOfTwoNodes() = assertEquals(
        setOf(
            NodeIndicatorInPlot("alex", "np2a"),
            NodeIndicatorInPlot("alex", "vp2"),
            NodeIndicatorInPlot("alex", "n2")
        ),
        plot.getChildNodeIds(setOf(NodeIndicatorInPlot("alex", "s2"), NodeIndicatorInPlot("alex", "np2a")))
    )

    @Test
    fun allTopLevelTrue() =
        assertTrue(plot.allTopLevel(setOf(NodeIndicatorInPlot("cleo", "s1"), NodeIndicatorInPlot("alex", "s2"))))

    @Test
    fun allTopLevelFalse() =
        assertFalse(plot.allTopLevel(setOf(NodeIndicatorInPlot("cleo", "np1"), NodeIndicatorInPlot("alex", "v2"))))

    @Test
    fun transformNodesInMultipleTrees() = assertEquals(
        UnpositionedPlot(
            trees = IdMap(
                UnpositionedTree(
                    id = "cleo",
                    sentence = "Cleo laughed.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s1", "S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                        UnpositionedBranchingNode("np1", "NP", TreeCoordsOffset(0.0, -4.0), setOf("n1")),
                        UnpositionedTerminalNode("n1", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedTerminalNode("vp1", "VP", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 12), false),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                ),
                UnpositionedTree(
                    id = "alex",
                    sentence = "Alex baked cookies.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 1.0), setOf("np2a", "vp2")),
                        UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset(0.0, 0.0), setOf("n2")),
                        UnpositionedTerminalNode("n2", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset(0.0, 0.0), setOf("v2", "np2b")),
                        UnpositionedTerminalNode("v2", "V", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 10), false),
                        UnpositionedTerminalNode("np2b", 
                            "NP",
                            TreeCoordsOffset(0.0, 0.0),
                            StringSlice(11, 18),
                            false
                        ),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                ),
            ),
        ),
        plot.transformNodes(setOf(NodeIndicatorInPlot("cleo", "np1"), NodeIndicatorInPlot("alex", "s2"))) {
            it.changeOffset(TreeCoordsOffset(0.0, -4.0))
        }
    )

    @Test
    fun deleteNodesInMultipleTrees() = assertEquals(
        UnpositionedPlot(
            trees = IdMap(
                UnpositionedTree(
                    id = "cleo",
                    sentence = "Cleo laughed.",
                    nodes = IdMap(
                        UnpositionedTerminalNode("n1", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedTerminalNode("vp1", "VP", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 12), false),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                ),
                UnpositionedTree(
                    id = "alex",
                    sentence = "Alex baked cookies.",
                    nodes = IdMap(
                        UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a")),
                        UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset(0.0, 0.0), setOf("n2")),
                        UnpositionedTerminalNode("n2", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        UnpositionedTerminalNode("v2", "V", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 10), false),
                        UnpositionedTerminalNode("np2b", 
                            "NP",
                            TreeCoordsOffset(0.0, 0.0),
                            StringSlice(11, 18),
                            false
                        ),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                ),
            ),
        ),
        plot.deleteNodes(
            setOf(
                NodeIndicatorInPlot("cleo", "s1"),
                NodeIndicatorInPlot("cleo", "np1"),
                NodeIndicatorInPlot("alex", "vp2")
            )
        )
    )
}
