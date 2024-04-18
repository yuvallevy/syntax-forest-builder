package space.yuvalinguist.npbloom.content.conversion

import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertFailsWith

class TopDownTreeNodeTest {
    private val tree = TopDownTreeBranchingNode(
        "S",
        listOf(
            TopDownTreeBranchingNode(
                "NP",
                listOf(
                    TopDownTreeTerminalNode("N", "Alice", false),
                ),
            ),
            TopDownTreeBranchingNode(
                "VP",
                listOf(
                    TopDownTreeTerminalNode("V", "gave", false),
                    TopDownTreeTerminalNode("NP", "Bob", true),
                    TopDownTreeBranchingNode(
                        "NP",
                        listOf(
                            TopDownTreeTerminalNode("D", "the", false),
                            TopDownTreeTerminalNode("N", "gerbil", false),
                        ),
                    ),
                ),
            ),
        ),
    )

    private val singleTerminalNodeLbn = "[N Alice]"
    private val topLevelMixedNodeLbn = "[NP the [N gerbil]]"
    private val completeSentenceLbn = "[S [NP [N Alice]] [VP [V gave] [NP^ Bob] [NP [D the] [N gerbil]]]]"
    private val lbnWithDeepMixedNode = "[S [NP the [N gerbil]]]"
    private val malformedLbnMissingClosingBracket = completeSentenceLbn.drop(1)
    private val malformedLbnExtraClosingBracket = "$completeSentenceLbn]"

    @Test
    fun fromSingleTerminalNodeLbn() {
        assertEquals(
            TopDownTreeNode.fromLabelledBracketNotation(singleTerminalNodeLbn),
            TopDownTreeTerminalNode("N", "Alice", false),
        )
    }

    @Test
    fun fromTopLevelMixedNodeLbn() {
        assertEquals(
            TopDownTreeNode.fromLabelledBracketNotation(topLevelMixedNodeLbn),
            TopDownTreeBranchingNode(
                "NP",
                listOf(
                    TopDownTreeTerminalNode("", "the", false),
                    TopDownTreeTerminalNode("N", "gerbil", false),
                ),
            ),
        )
    }

    @Test
    fun fromCompleteSentenceLbn() {
        assertEquals(TopDownTreeNode.fromLabelledBracketNotation(completeSentenceLbn), tree)
    }

    @Test
    fun fromLbnWithDeepMixedNode() {
        assertEquals(
            TopDownTreeNode.fromLabelledBracketNotation(lbnWithDeepMixedNode),
            TopDownTreeBranchingNode(
                "S",
                listOf(
                    TopDownTreeBranchingNode(
                        "NP",
                        listOf(
                            TopDownTreeTerminalNode("", "the", false),
                            TopDownTreeTerminalNode("N", "gerbil", false),
                        ),
                    ),
                ),
            ),
        )
    }

    @Test
    fun fromMalformedLbnMissingClosingBracket() {
        assertFailsWith<IllegalArgumentException> {
            TopDownTreeNode.fromLabelledBracketNotation(malformedLbnMissingClosingBracket)
        }
    }

    @Test
    fun fromMalformedLbnExtraClosingBracket() {
        assertFailsWith<IllegalArgumentException> {
            TopDownTreeNode.fromLabelledBracketNotation(malformedLbnExtraClosingBracket)
        }
    }

    @Test
    fun toLabelledBracketNotation() {
        assertEquals(tree.toLabelledBracketNotation(), completeSentenceLbn)
    }
}