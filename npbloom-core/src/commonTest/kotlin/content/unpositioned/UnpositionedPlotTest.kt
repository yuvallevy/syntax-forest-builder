package content.unpositioned

import NoSuchTreeException
import content.NodeIndicatorInPlot
import content.StringSlice
import kotlin.test.*

class UnpositionedPlotTest {
    private val plot = UnpositionedPlot(
        trees = mapOf(
            "cleo" to UnpositionedTree(
                sentence = "Cleo laughed.",
                nodes = mapOf(
                    "s1" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                    "np1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n1")),
                    "n1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    "vp1" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            "alex" to UnpositionedTree(
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                    "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                    "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                    "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
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
                    sentence = "Cleo laughed.",
                    nodes = mapOf(
                        "s1" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                        "np1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n1")),
                        "n1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                        "vp1" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                ), UnpositionedTree(
                    sentence = "Alex baked cookies.",
                    nodes = mapOf(
                        "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                        "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                        "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                        "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                        "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                        "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
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
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                    "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                    "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                    "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
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
                trees = mapOf(
                    "cleo" to UnpositionedTree(
                        sentence = "Cleo laughed.",
                        nodes = mapOf(
                            "s1" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                            "np1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n1")),
                            "n1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            "vp1" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 12)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                    "alex" to UnpositionedTree(
                        sentence = "Alex baked cookies.",
                        nodes = mapOf(
                            "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 8.0), setOf("np2a", "vp2")),
                            "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                            "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                            "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                            "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                ),
            ),
            plot.setTree("alex", UnpositionedTree(
                sentence = "Alex baked cookies.",
                nodes = mapOf(
                    "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 8.0), setOf("np2a", "vp2")),
                    "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                    "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                    "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                    "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                    "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                ),
                offset = PlotCoordsOffset.ZERO,
            ))
        )

    @Test
    fun removeTree() =
        assertEquals(
            UnpositionedPlot(
                trees = mapOf(
                    "alex" to UnpositionedTree(
                        sentence = "Alex baked cookies.",
                        nodes = mapOf(
                            "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                            "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("n2")),
                            "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                            "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                            "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                ),
            ),
            plot.removeTree("cleo")
        )

    @Test
    fun mapTrees() =
        assertContentEquals(
            arrayOf(
                "cleo" to "Cleo laughed.",
                "alex" to "Alex baked cookies.",
            ),
            plot.mapTrees { treeId, tree -> treeId to tree.sentence }
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
        setOf(NodeIndicatorInPlot("alex", "np2a"), NodeIndicatorInPlot("alex", "vp2"), NodeIndicatorInPlot("alex", "n2")),
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
            trees = mapOf(
                "cleo" to UnpositionedTree(
                    sentence = "Cleo laughed.",
                    nodes = mapOf(
                        "s1" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np1", "vp1")),
                        "np1" to UnpositionedBranchingNode("NP", TreeCoordsOffset(0.0, -4.0), setOf("n1")),
                        "n1" to UnpositionedTerminalNode("N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        "vp1" to UnpositionedTerminalNode("VP", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 12), false),
                    ),
                    offset = PlotCoordsOffset.ZERO,
                ),
                "alex" to UnpositionedTree(
                    sentence = "Alex baked cookies.",
                    nodes = mapOf(
                        "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 1.0), setOf("np2a", "vp2")),
                        "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset(0.0, 0.0), setOf("n2")),
                        "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        "vp2" to UnpositionedBranchingNode("VP", TreeCoordsOffset(0.0, 0.0), setOf("v2", "np2b")),
                        "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 10), false),
                        "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset(0.0, 0.0), StringSlice(11, 18), false),
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
            trees = mapOf(
                "cleo" to UnpositionedTree(
                    sentence = "Cleo laughed.",
                    nodes = mapOf(
                        "n1" to UnpositionedTerminalNode("N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        "vp1" to UnpositionedTerminalNode("VP", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 12), false),
                    ),
                    offset = PlotCoordsOffset(0.0, 0.0),
                ),
                "alex" to UnpositionedTree(
                    sentence = "Alex baked cookies.",
                    nodes = mapOf(
                        "s2" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("np2a")),
                        "np2a" to UnpositionedBranchingNode("NP", TreeCoordsOffset(0.0, 0.0), setOf("n2")),
                        "n2" to UnpositionedTerminalNode("N", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 4), false),
                        "v2" to UnpositionedTerminalNode("V", TreeCoordsOffset(0.0, 0.0), StringSlice(5, 10), false),
                        "np2b" to UnpositionedTerminalNode("NP", TreeCoordsOffset(0.0, 0.0), StringSlice(11, 18), false),
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
