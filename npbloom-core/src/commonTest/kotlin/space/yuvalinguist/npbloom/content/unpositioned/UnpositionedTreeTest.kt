package space.yuvalinguist.npbloom.content.unpositioned

import space.yuvalinguist.npbloom.NoSuchNodeException
import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import kotlin.test.*

class UnpositionedTreeTest {
    private val tree = UnpositionedTree(
        id = "ia9iV",
        sentence = "Noun verbed.",
        nodes = EntitySet(
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    private val treeWithoutTopLevelTerminalNode = UnpositionedTree(
        id = "ia9iV",
        sentence = "Noun verbed.",
        nodes = EntitySet(
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    private val treeWithoutTopLevelBranchingNode = UnpositionedTree(
        id = "ia9iV",
        sentence = "Noun verbed.",
        nodes = EntitySet(
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    private val treeWithStrandedNode = UnpositionedTree(
        id = "Y43W8qV",
        sentence = "Noun verbed it.",
        nodes = EntitySet(
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedFormerlyTerminalNode("stranded", "VP", TreeCoordsOffset(2.0, -10.0), StringSlice(5, 14),
                true),
            UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
            UnpositionedTerminalNode("term3", "N", TreeCoordsOffset.ZERO, StringSlice(12, 14)),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    private val treeWithNodeMissingBranches = UnpositionedTree(
        id = "VJsCdW",
        sentence = "Noun verbed and verbed.",
        nodes = EntitySet(
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedBranchingNode("branch2", "VP", TreeCoordsOffset.ZERO, setOf("term2")),
            UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
            UnpositionedTerminalNode("term3", "Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15)),
            UnpositionedTerminalNode("term4", "VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    private val treeWithTerminalBecomingBranching = UnpositionedTree(
        id = "cQotq75p",
        sentence = "Noun verbed adverbly.",
        nodes = EntitySet(
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "shapeshifter")),
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            UnpositionedTerminalNode("shapeshifter", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 20), true),
            UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
            UnpositionedTerminalNode("term3", "AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
        ),
        coordsInPlot = CoordsInPlot.ZERO,
    )

    @Test
    fun nodeIds() =
        assertEquals(setOf("top", "branch1", "term1", "term2"), tree.nodeIds)

    @Test
    fun nodeCountZero() =
        assertEquals(
            0,
            UnpositionedTree(id = "L18", sentence = "", nodes = EntitySet(), coordsInPlot = CoordsInPlot.ZERO).nodeCount
        )

    @Test
    fun nodeCountNonzero() =
        assertEquals(4, tree.nodeCount)

    @Test
    fun hasNodesTrue() =
        assertTrue(tree.hasNodes)

    @Test
    fun hasNodesFalse() =
        assertFalse(
            UnpositionedTree(
                id = "zif",
                sentence = "",
                nodes = EntitySet(),
                coordsInPlot = CoordsInPlot.ZERO
            ).hasNodes
        )

    @Test
    fun nodeById() =
        assertEquals(
            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
            treeWithoutTopLevelBranchingNode.node("term1")
        )

    @Test
    fun nodeByIdNonexistent() {
        assertFailsWith(NoSuchNodeException::class) {
            treeWithoutTopLevelBranchingNode.node("branch2")
        }
    }

    @Test
    fun treeContainsIdTrue() =
        assertTrue("branch1" in tree)

    @Test
    fun treeContainsIdFalse() =
        assertFalse("branch2" in tree)

    @Test
    fun setNode() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "NP", TreeCoordsOffset.ZERO, StringSlice(0, 4), true),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.setNode(
                UnpositionedTerminalNode("term1", "NP", TreeCoordsOffset.ZERO, StringSlice(0, 4), true)
            )
        )

    @Test
    fun removeNode() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11)),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.removeNode("term1")
        )

    @Test
    fun anyNodesTrue() =
        assertTrue(tree.anyNodes { "V" in it.label })

    @Test
    fun anyNodesFalse() =
        assertFalse(tree.anyNodes { "Adj" in it.label })

    @Test
    fun isCompleteTrue() =
        assertTrue(tree.isComplete)

    @Test
    fun isCompleteFalse() =
        assertFalse(treeWithoutTopLevelBranchingNode.isComplete)

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
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("new", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelTerminalNode.insertNode(
                InsertedTerminalNode("new", "V", null, StringSlice(5, 11), false)
            )
        )

    @Test
    fun insertTopLevelTerminalNodeWithTriangle() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("new", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelTerminalNode.insertNode(
                InsertedTerminalNode("new", "VP", null, StringSlice(5, 11), true)
            )
        )

    @Test
    fun insertTopLevelBranchingNodeWithChild() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedBranchingNode("new", "VP", TreeCoordsOffset.ZERO, setOf("term2")),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.insertNode(
                InsertedBranchingNode("new", "VP", null, setOf("term2"))
            )
        )

    @Test
    fun insertTopLevelBranchingNodeWithTwoChildren() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedBranchingNode("new", "S", TreeCoordsOffset.ZERO, setOf("branch1", "term2")),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithoutTopLevelBranchingNode.insertNode(
                InsertedBranchingNode("new", "S", null, setOf("branch1", "term2"))
            )
        )

    @Test
    fun insertBranchingNodeWithTerminalChild() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("new")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedBranchingNode("new", "N'", TreeCoordsOffset.ZERO, setOf("term1")),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("new", "N'", "branch1", setOf("term1"))
            )
        )

    @Test
    fun insertBranchingNodeWithBranchingChild() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("term2", "new")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedBranchingNode("new", "?", TreeCoordsOffset.ZERO, setOf("branch1")),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("new", "?", "top", setOf("branch1"))
            )
        )

    @Test
    fun insertBranchingNodeWithTwoChildren() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("new")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedBranchingNode("new", "?", TreeCoordsOffset.ZERO, setOf("branch1", "term2")),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.insertNode(
                InsertedBranchingNode("new", "?", "top", setOf("branch1", "term2"))
            )
        )

    @Test
    fun setNodeLabel() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    UnpositionedBranchingNode("branch1", "test", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.transformNode("branch1") { it.withLabel("test") }
        )

    @Test
    fun setTrianglehoodOfTwoNodes() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), true),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
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
                id = "VJsCdW",
                sentence = "Noun verbed and verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("branch2", "VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                    UnpositionedTerminalNode("term3", "Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15), false),
                    UnpositionedTerminalNode("term4", "VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithNodeMissingBranches.adoptNodes("branch2", setOf("term3"))
        )

    @Test
    fun assignNodeAsChildOfTerminal() =
        assertEquals(
            UnpositionedTree(
                id = "cQotq75p",
                sentence = "Noun verbed adverbly.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0),
                        setOf("branch1", "shapeshifter")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("shapeshifter", "VP", TreeCoordsOffset.ZERO, setOf("term2")),
                    UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedTerminalNode("term3", "AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithTerminalBecomingBranching.adoptNodes("shapeshifter", setOf("term2"))
        )

    @Test
    fun assignNodeAsChildOfStranded() =
        assertEquals(
            UnpositionedTree(
                id = "Y43W8qV",
                sentence = "Noun verbed it.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("stranded", "VP", TreeCoordsOffset.ZERO, setOf("term2")),
                    UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedTerminalNode("term3", "N", TreeCoordsOffset.ZERO, StringSlice(12, 14), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithStrandedNode.adoptNodes("stranded", setOf("term2"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfBranching() =
        assertEquals(
            UnpositionedTree(
                id = "VJsCdW",
                sentence = "Noun verbed and verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "branch2")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("branch2", "VP", TreeCoordsOffset.ZERO,
                        setOf("term2", "term3", "term4")),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), true),
                    UnpositionedTerminalNode("term3", "Conj", TreeCoordsOffset.ZERO, StringSlice(12, 15), false),
                    UnpositionedTerminalNode("term4", "VP", TreeCoordsOffset.ZERO, StringSlice(16, 22), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithNodeMissingBranches.adoptNodes("branch2", setOf("term3", "term4"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfTerminal() =
        assertEquals(
            UnpositionedTree(
                id = "cQotq75p",
                sentence = "Noun verbed adverbly.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0),
                        setOf("branch1", "shapeshifter")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("shapeshifter", "VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedTerminalNode("term3", "AdvP", TreeCoordsOffset.ZERO, StringSlice(12, 20), true),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithTerminalBecomingBranching.adoptNodes("shapeshifter", setOf("term2", "term3"))
        )

    @Test
    fun assignTwoNodesAsChildrenOfStranded() =
        assertEquals(
            UnpositionedTree(
                id = "Y43W8qV",
                sentence = "Noun verbed it.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "stranded")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedBranchingNode("stranded", "VP", TreeCoordsOffset.ZERO, setOf("term2", "term3")),
                    UnpositionedTerminalNode("term2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                    UnpositionedTerminalNode("term3", "N", TreeCoordsOffset.ZERO, StringSlice(12, 14), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            treeWithStrandedNode.adoptNodes("stranded", setOf("term2", "term3"))
        )

    @Test
    fun notStrandedWhenDisowningIfChildrenLeft() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("term2")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.disownNodes("top", setOf("branch1"))
        )

    @Test
    fun strandedWhenDisowningIfOnlyChildDisowned() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    UnpositionedFormerlyBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO,
                        EntitySet(
                            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false)
                        )
                    ),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.disownNodes("branch1", setOf("term1"))
        )

    @Test
    fun strandedWhenDisowningIfAllChildrenDisowned() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedFormerlyBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0),
                        EntitySet(
                            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                            UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.disownNodes("top", setOf("branch1", "term2"))
        )

    @Test
    fun removeExistingConnectionWhenAdopting() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1", "term2")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
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
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "test", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term2")),
                    UnpositionedBranchingNode("branch1", "test", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "test", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "test", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.transformAllNodes { it.withLabel("test") }
        )

    @Test
    fun deleteTopLevel() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("top"))
        )

    @Test
    fun deleteBranching() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("term2")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("branch1"))
        )

    @Test
    fun deleteTerminal() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("term2"))
        )

    @Test
    fun deleteParentAndChild() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("top", "term2"))
        )

    @Test
    fun deleteAncestorAndDescendant() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedFormerlyBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO,
                        EntitySet(
                            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("top", "term1"))
        )

    @Test
    fun deleteUnrelatedNodes() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1")),
                    UnpositionedFormerlyBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO,
                        EntitySet(
                            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
            ),
            tree.deleteNodes(setOf("term1", "term2"))
        )

    @Test
    fun strandedWhenChildrenGone() =
        assertEquals(
            UnpositionedTree(
                id = "ia9iV",
                sentence = "Noun verbed.",
                nodes = EntitySet(
                    UnpositionedFormerlyBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0),
                        EntitySet(
                            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset.ZERO, setOf("term1")),
                            UnpositionedTerminalNode("term2", "VP", TreeCoordsOffset.ZERO, StringSlice(5, 11), false),
                            UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                        )
                    ),
                    UnpositionedTerminalNode("term1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4), false),
                ),
                coordsInPlot = CoordsInPlot.ZERO,
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