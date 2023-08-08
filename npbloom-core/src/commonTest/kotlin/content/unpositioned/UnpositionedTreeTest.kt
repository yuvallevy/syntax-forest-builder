package content.unpositioned

import content.StringSlice
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertNotSame
import kotlin.test.assertSame

class UnpositionedTreeTest {
    private val tree = UnpositionedTree(
        sentence = "Noun verbed.",
        nodes = mapOf(
            "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithoutTopLevelTerminalNode = UnpositionedTree(
        sentence = "Noun verbed.",
        nodes = mapOf(
            "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithoutTopLevelBranchingNode = UnpositionedTree(
        sentence = "Noun verbed.",
        nodes = mapOf(
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithStrandedNode = UnpositionedTree(
        sentence = "Noun verbed it.",
        nodes = mapOf(
            "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            "stranded" to UnpositionedFormerlyTerminalNode(
                "VP",
                TreeCoordsOffset(2.0, -10.0),
                StringSlice(5, 14),
                true
            ),
            "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
            "term3" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(12, 14)),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithNodeMissingBranches = UnpositionedTree(
        sentence = "Noun verbed and verbed.",
        nodes = mapOf(
            "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            "branch2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2")),
            "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
            "term3" to UnpositionedTerminalNode("Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15)),
            "term4" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    private val treeWithTerminalBecomingBranching = UnpositionedTree(
        sentence = "Noun verbed adverbly.",
        nodes = mapOf(
            "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "shapeshifter")),
            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            "shapeshifter" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 20), true),
            "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
            "term3" to UnpositionedTerminalNode("AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
        ),
        offset = PlotCoordsOffset.ZERO,
    )

    @Test
    fun oneNodeParentId() =
        assertEquals(setOf("branch1"), tree.getParentNodeIds(setOf("term1")))

    @Test
    fun twoSiblingNodesParentId() =
        assertEquals(setOf("top"), tree.getParentNodeIds(setOf("branch1", "term2")))

    @Test
    fun twoNonSiblingNodesParentIds() =
        assertEquals(setOf("top", "branch1"), tree.getParentNodeIds(setOf("branch1", "term1")))

    @Test
    fun noParentIdForTopLevelNode() =
        assertEquals(emptySet(), tree.getParentNodeIds(setOf("top")))

    @Test
    fun oneParentIdForTwoNodesIfOneTopLevel() =
        assertEquals(setOf("branch1"), tree.getParentNodeIds(setOf("top", "term1")))

    @Test
    fun sliceTerminalId() =
        assertEquals(setOf("term2"), tree.getNodeIdsAssignedToSlice(StringSlice(5, 11)))

    @Test
    fun sliceTerminalIdPartialSliceSelection() =
        assertEquals(setOf("term2"), tree.getNodeIdsAssignedToSlice(StringSlice(6, 10)))

    @Test
    fun multipleSliceTerminalIds() =
        assertEquals(setOf("term1", "term2"), tree.getNodeIdsAssignedToSlice(StringSlice(3, 9)))

    @Test
    fun noSliceTerminalIds() =
        assertEquals(emptySet(), treeWithoutTopLevelTerminalNode.getNodeIdsAssignedToSlice(StringSlice(5, 11)))

    @Test
    fun insertTopLevelTerminalNode() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "new" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithoutTopLevelTerminalNode.insertNode(
                InsertedTerminalNode("V", null, StringSlice(5, 11), false),
                "new"
            )
        )

    @Test
    fun insertTopLevelTerminalNodeWithTriangle() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "new" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithoutTopLevelTerminalNode.insertNode(
                InsertedTerminalNode("VP", null, StringSlice(5, 11), true),
                "new"
            )
        )

    @Test
    fun insertTopLevelBranchingNodeWithChild() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "new" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2")),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.insertNode(
                InsertedBranchingNode("VP", null, setOf("term2")),
                "new"
            )
        )

    @Test
    fun insertTopLevelBranchingNodeWithTwoChildren() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "new" to UnpositionedBranchingNode("S", TreeCoordsOffset.ZERO, setOf("branch1", "term2")),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.insertNode(
                InsertedBranchingNode("S", null, setOf("branch1", "term2")),
                "new"
            )
        )

    @Test
    fun insertBranchingNodeWithTerminalChild() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("new")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "new" to UnpositionedBranchingNode("N'", TreeCoordsOffset.ZERO, setOf("term1")),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("N'", "branch1", setOf("term1")),
                "new"
            )
        )

    @Test
    fun insertBranchingNodeWithBranchingChild() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("term2", "new")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "new" to UnpositionedBranchingNode("?", TreeCoordsOffset.ZERO, setOf("branch1")),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("?", "top", setOf("branch1")),
                "new"
            )
        )

    @Test
    fun insertBranchingNodeWithTwoChildren() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("new")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "new" to UnpositionedBranchingNode("?", TreeCoordsOffset.ZERO, setOf("branch1", "term2")),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("?", "top", setOf("branch1", "term2")),
                "new"
            )
        )

    @Test
    fun setNodeLabel() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    "branch1" to UnpositionedBranchingNode("test", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.transformNode("branch1") { it.withLabel("test") }
        )

    @Test
    fun setTrianglehoodOfTwoNodes() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), true),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.transformNodes(setOf("term1", "term2")) {
                if (it is UnpositionedTerminalNode) it.copy(triangle = true)
                else it
            }
        )

    @Test
    fun assignNodeAsChildOfBranching() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed and verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "branch2" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                    "term3" to UnpositionedTerminalNode("Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15), false),
                    "term4" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithNodeMissingBranches.adoptNodes("branch2", setOf("term3"))
        )

    @Test
    fun assignNodeAsChildOfTerminal() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed adverbly.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode(
                        "S",
                        TreeCoordsOffset(0.0, 5.0),
                        setOf("branch1", "shapeshifter")
                    ),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "shapeshifter" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2")),
                    "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "term3" to UnpositionedTerminalNode("AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithTerminalBecomingBranching.adoptNodes("shapeshifter", setOf("term2"))
        )

    @Test
    fun assignNodeAsChildOfStranded() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed it.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "stranded" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2")),
                    "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "term3" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(12, 14), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithStrandedNode.adoptNodes("stranded", setOf("term2"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfBranching() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed and verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "branch2" to UnpositionedBranchingNode(
                        "VP",
                        TreeCoordsOffset.ZERO,
                        setOf("term2", "term3", "term4")
                    ),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                    "term3" to UnpositionedTerminalNode("Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15), false),
                    "term4" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithNodeMissingBranches.adoptNodes("branch2", setOf("term3", "term4"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfTerminal() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed adverbly.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode(
                        "S",
                        TreeCoordsOffset(0.0, 5.0),
                        setOf("branch1", "shapeshifter")
                    ),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "shapeshifter" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "term3" to UnpositionedTerminalNode("AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithTerminalBecomingBranching.adoptNodes("shapeshifter", setOf("term2", "term3"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfStranded() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed it.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "stranded" to UnpositionedBranchingNode("VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    "term2" to UnpositionedTerminalNode("V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    "term3" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(12, 14), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            treeWithStrandedNode.adoptNodes("stranded", setOf("term2", "term3"))
        )

    @Test
    fun notStrandedWhenDisowningIfChildrenLeft() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("term2")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.disownNodes("top", setOf("branch1"))
        )

    @Test
    fun strandedWhenDisowningIfOnlyChildDisowned() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    "branch1" to UnpositionedFormerlyBranchingNode(
                        "NP", TreeCoordsOffset.ZERO, mapOf(
                            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.disownNodes("branch1", setOf("term1"))
        )

    @Test
    fun strandedWhenDisowningIfAllChildrenDisowned() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedFormerlyBranchingNode(
                        "S", TreeCoordsOffset(0.0, 5.0), mapOf(
                            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                            "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.disownNodes("top", setOf("branch1", "term2"))
        )

    @Test
    fun removeExistingConnectionWhenAdopting() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1", "term2")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.adoptNodes("branch1", setOf("term2"))
        )

    @Test
    fun noSelfAdoption() =
        assertEquals(tree, tree.adoptNodes("top", setOf("top")))

    @Test
    fun changeAllNodes() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("test", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    "branch1" to UnpositionedBranchingNode("test", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("test", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("test", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.transformAllNodes { it.withLabel("test") }
        )

    @Test
    fun deleteTopLevel() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("top"))
        )

    @Test
    fun deleteBranching() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("term2")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("branch1"))
        )

    @Test
    fun deleteTerminal() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("term2"))
        )

    @Test
    fun deleteParentAndChild() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("top", "term2"))
        )

    @Test
    fun deleteAncestorAndDescendant() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "branch1" to UnpositionedFormerlyBranchingNode(
                        "NP", TreeCoordsOffset.ZERO, mapOf(
                            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("top", "term1"))
        )

    @Test
    fun deleteUnrelatedNodes() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedBranchingNode("S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    "branch1" to UnpositionedFormerlyBranchingNode(
                        "NP", TreeCoordsOffset.ZERO, mapOf(
                            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("term1", "term2"))
        )

    @Test
    fun strandedWhenChildrenGone() =
        assertEquals(
            UnpositionedTree(
                sentence = "Noun verbed.",
                nodes = mapOf(
                    "top" to UnpositionedFormerlyBranchingNode(
                        "S", TreeCoordsOffset(0.0, 5.0), mapOf(
                            "branch1" to UnpositionedBranchingNode("NP", TreeCoordsOffset.ZERO, setOf("term1")),
                            "term2" to UnpositionedTerminalNode("VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                            "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    "term1" to UnpositionedTerminalNode("N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                offset = PlotCoordsOffset.ZERO,
            ),
            tree.deleteNodes(setOf("branch1", "term2"))
        )

    @Test
    fun otherNodesRefEqualAfterChange() {
        val treeAfterChange = tree.transformNode("branch1") { it.withLabel("test") }
        assertSame(treeAfterChange.nodes["term2"], tree.nodes["term2"])
    }

    @Test
    fun childrenRefEqualAfterDelete() {
        val treeAfterChange = tree.deleteNodes(setOf("top"))
        assertSame(treeAfterChange.nodes["branch1"], tree.nodes["branch1"])
        assertSame(treeAfterChange.nodes["term2"], tree.nodes["term2"])
    }

    @Test
    fun changedNodesNotRefEqual() {
        val treeAfterChange = tree.transformNode("branch1") { it.withLabel("test") }
        assertNotSame(treeAfterChange.nodes["branch1"], tree.nodes["branch1"])
    }

    @Test
    fun parentsOfChangedNodesNotRefEqual() {
        val treeAfterChange = tree.deleteNodes(setOf("branch1"))
        assertNotSame(treeAfterChange.nodes["top"], tree.nodes["top"])
    }
}