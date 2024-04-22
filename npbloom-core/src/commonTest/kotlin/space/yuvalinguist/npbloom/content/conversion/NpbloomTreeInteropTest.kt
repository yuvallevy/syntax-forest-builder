package space.yuvalinguist.npbloom.content.conversion

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedBranchingNode
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTerminalNode
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTree
import kotlin.test.Test
import kotlin.test.assertEquals

class NpbloomTreeInteropTest {
    private val topLevelTerminalNode = TopDownTreeTerminalNode("N", "Alice", false)
    private val branchingNode = TopDownTreeBranchingNode(
        "NP",
        listOf(
            TopDownTreeTerminalNode("D", "A", false),
            TopDownTreeTerminalNode("N", "dog", false),
        ),
    )

    private val unpositionedTreeWithTopLevelTerminalNode = UnpositionedTree(
        id = "0",
        sentence = "Alice",
        nodes = EntitySet(
            UnpositionedTerminalNode("1", "N", slice = StringSlice(0, 5), triangle = false),
        ),
    )

    private val unpositionedTreeWithBranchingNode = UnpositionedTree(
        id = "0",
        sentence = "A   dog",
        nodes = EntitySet(
            UnpositionedTerminalNode("1", "D", slice = StringSlice(0, 1), triangle = false),
            UnpositionedTerminalNode("2", "N", slice = StringSlice(4, 7), triangle = false),
            UnpositionedBranchingNode("3", "NP", children = setOf("1", "2")),
        ),
    )

    private val unpositionedTreeWithBranchingNodeReversed = UnpositionedTree(
        id = "0",
        sentence = "A   dog",
        nodes = EntitySet(
            UnpositionedTerminalNode("1", "N", slice = StringSlice(4, 7), triangle = false),
            UnpositionedTerminalNode("2", "D", slice = StringSlice(0, 1), triangle = false),
            UnpositionedBranchingNode("3", "NP", children = setOf("1", "2")),
        ),
    )

    @Test
    fun topLevelTerminalNodeToUnpositionedTree() {
        val tree = topLevelTerminalNode.toUnpositionedTree()
        assertEquals(1, tree.nodeCount)
        assertEquals(listOf("N"), tree.nodes.map { it.label })
        assertEquals(listOf(StringSlice(0, 5)), tree.nodes.map { (it as? UnpositionedTerminalNode)?.slice })
        assertEquals("Alice", tree.sentence)
    }

    @Test
    fun branchingNodeToUnpositionedTree() {
        val tree = branchingNode.toUnpositionedTree()
        val nodeIds = tree.nodes.map { it.id }
        assertEquals(3, tree.nodeCount)
        assertEquals(listOf("D", "N", "NP"), tree.nodes.map { it.label })
        assertEquals(
            listOf(null, null, setOf(nodeIds[0], nodeIds[1])),
            tree.nodes.map { (it as? UnpositionedBranchingNode)?.children })
        assertEquals(
            listOf(StringSlice(0, 1), StringSlice(4, 7), null),
            tree.nodes.map { (it as? UnpositionedTerminalNode)?.slice })
        assertEquals("A   dog", tree.sentence)
    }

    @Test
    fun topLevelTerminalNodeToTopDownTreeNode() {
        assertEquals(topLevelTerminalNode, unpositionedTreeWithTopLevelTerminalNode.toTopDownTree())
    }

    @Test
    fun branchingNodeToTopDownTreeNode() {
        assertEquals(branchingNode, unpositionedTreeWithBranchingNode.toTopDownTree())
    }

    @Test
    fun branchingNodeToTopDownTreeNodeReversed() {
        assertEquals(branchingNode, unpositionedTreeWithBranchingNodeReversed.toTopDownTree())
    }
}