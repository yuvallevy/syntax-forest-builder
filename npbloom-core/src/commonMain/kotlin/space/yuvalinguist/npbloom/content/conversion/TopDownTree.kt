package space.yuvalinguist.npbloom.content.conversion

/**
 * A tree built from the root down to the sentence instead of from the sentence up to the root.
 * This is useful for converting between different standard formats for representing trees
 * (e.g. labelled bracket notation or LaTeX qtree).
 */
sealed interface TopDownTreeNode {
    val label: String

    fun toLabelledBracketNotation(): String

    companion object {
        fun fromLabelledBracketNotation(lbn: String) = parseLbn(lbn)
    }
}

data class TopDownTreeBranchingNode(
    override val label: String,
    val children: List<TopDownTreeNode>,
) : TopDownTreeNode {
    override fun toLabelledBracketNotation(): String =
        "[$label ${children.joinToString(" ", transform = TopDownTreeNode::toLabelledBracketNotation)}]"
}

data class TopDownTreeTerminalNode(
    override val label: String,
    val content: String,
    val triangle: Boolean,
) : TopDownTreeNode {
    override fun toLabelledBracketNotation(): String = "[$label${if (triangle) "^" else ""} $content]"
}