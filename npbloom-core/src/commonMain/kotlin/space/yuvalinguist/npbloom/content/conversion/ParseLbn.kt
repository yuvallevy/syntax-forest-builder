package space.yuvalinguist.npbloom.content.conversion

/**
 * Parses a string in labelled bracket notation into a tree.
 * The input string should be well-formed, i.e. it should have balanced brackets, otherwise an exception will be thrown.
 * "path" is a list of indices, each index representing the index of a child node in the path from the root to the
 * node currently being parsed. This is used to keep track of the current position in the tree. (An empty list
 * indicates that the root node is being parsed.)
 * "builtTree" stores a progressively growing tree as the string is parsed.
 * e.g. "[S [NP [N Alice]] [VP [V likes] [NP^ Bob]]]"
 */
tailrec fun parseLbn(lbn: String, path: List<Int> = emptyList(), builtTree: TopDownTreeNode? = null): TopDownTreeNode {
    // Starting a new tree
    if (builtTree == null) {
        // String must start with an opening bracket, otherwise this is not well-formed labelled bracket notation
        if (lbn.isEmpty()) throw IllegalArgumentException("Unexpected end of string, expected opening bracket")
        if (!lbn.startsWith('[')) throw IllegalArgumentException("Expected opening bracket, found ${lbn.first()}")
        // Remove the opening bracket and parse the rest
        return parseLbn(lbn.substring(1), path, TopDownTreeTerminalNode("", "", false))
    }

    // Reached the end of the string without closing all nodes
    if (lbn.isEmpty() && path.isNotEmpty())
        throw IllegalArgumentException("Unexpected end of string, expected closing bracket")

    // Opening a first child node of a branching node
    if (lbn.startsWith('[')) {
        // Normally the next node will be at index 0
        // An edge case is when this is a child node of what we thought was a terminal node
        // In this case, we need to convert the terminal node to a branching node with a single child
        // with an empty label, and the next child will be at index 1
        val nextNodePath = if (builtTree.hasContentAt(path)) path + 1 else path + 0
        return parseLbn(lbn.substring(1), nextNodePath, builtTree.coerceToBranchingNode().addChildAt(path))
    }

    // Closing a node
    if (lbn.startsWith(']')) {
        // Immediately opening a sibling node: move the index to the next sibling and continue parsing
        if (lbn.substring(1).trim().startsWith('[')) {
            val parentPath = path.dropLast(1)
            val siblingNodePath = parentPath + (path.last() + 1)
            return parseLbn(
                lbn.substring(lbn.indexOf('[') + 1),
                siblingNodePath,
                builtTree.coerceToBranchingNode().addChildAt(parentPath),
            )
        }

        // Closing a node: move the index to the parent and continue parsing
        val rest = lbn.substring(1).trim()
        // If there is no parent, we're done parsing, which means that there should be no more content to parse
        return if (path.isEmpty()) {
            if (rest.isEmpty()) builtTree
            else throw IllegalArgumentException("Expected end of string, found $rest")
        } else parseLbn(rest, path.dropLast(1), builtTree)
    }

    // Anything else is assumed to be a label and optionally some content, to be attached to a node
    // Look ahead until the next occurrence of any bracket
    val nextTextString = lbn.substring(0, lbn.indexOfAny(charArrayOf('[', ']')))
    val (label, content) = nextTextString.split(' ', limit = 2).map(String::trim)
    val rest = lbn.substring(lbn.indexOfAny(charArrayOf('[', ']'))).trim()
    if (path.isEmpty()) return parseLbn(rest, path, TopDownTreeTerminalNode(label, content, label.endsWith('^')))
    return parseLbn(
        rest,
        path,
        if (content.isEmpty()) builtTree.coerceToBranchingNode().setLabelAt(path, label)
        else builtTree.coerceToBranchingNode().setLabelAndContentAt(path, label, content)
    )
}

private fun <T> List<T>.setAtIndex(index: Int, value: T): List<T> {
    val mutableList = toMutableList()
    mutableList[index] = value
    return mutableList
}

private fun TopDownTreeNode.coerceToBranchingNode(): TopDownTreeBranchingNode = when (this) {
    is TopDownTreeBranchingNode -> this
    is TopDownTreeTerminalNode ->
        if (content.isEmpty()) TopDownTreeBranchingNode(label, emptyList())
        else TopDownTreeBranchingNode(label, listOf(this.copy(label = "")))
}

private fun TopDownTreeNode.hasContentAt(path: List<Int>): Boolean = when (this) {
    is TopDownTreeBranchingNode -> {
        if (path.isEmpty()) false else {
            val child = children[path.first()]
            if (path.size == 1) child is TopDownTreeTerminalNode && child.content.isNotEmpty()
            else child.coerceToBranchingNode().hasContentAt(path.drop(1))
        }
    }
    is TopDownTreeTerminalNode -> path.isEmpty() && content.isNotEmpty()
}

private fun TopDownTreeBranchingNode.addChildAt(path: List<Int>): TopDownTreeNode {
    if (path.isEmpty()) return copy(children = children + TopDownTreeBranchingNode("", emptyList()))
    val index = path.first()
    val newChildren = children.setAtIndex(index, children[index].coerceToBranchingNode().addChildAt(path.drop(1)))
    return copy(children = newChildren)
}

private fun TopDownTreeBranchingNode.setLabelAt(path: List<Int>, label: String): TopDownTreeNode {
    if (path.isEmpty()) return TopDownTreeBranchingNode(label.trimEnd('^'), children)
    val index = path.first()
    val newChildren = children.setAtIndex(index, when (val child = children[index]) {
        is TopDownTreeBranchingNode -> child.setLabelAt(path.drop(1), label)
        else -> TopDownTreeTerminalNode(label, "", label.endsWith('^'))
    })
    return copy(children = newChildren)
}

private fun TopDownTreeBranchingNode.setLabelAndContentAt(path: List<Int>, label: String, content: String): TopDownTreeNode {
    if (path.isEmpty()) return TopDownTreeTerminalNode(label.trimEnd('^'), content, label.endsWith('^'))
    val index = path.first()
    val newChildren = children.setAtIndex(index, when (val child = children[index]) {
        is TopDownTreeBranchingNode -> child.setLabelAndContentAt(path.drop(1), label, content)
        else -> TopDownTreeTerminalNode(child.label, content, false)
    })
    return copy(children = newChildren)
}