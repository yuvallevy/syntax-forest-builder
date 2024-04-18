package space.yuvalinguist.npbloom.content.conversion

import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedBranchingNode
import space.yuvalinguist.npbloom.content.unpositioned.UnpositionedTerminalNode
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
}