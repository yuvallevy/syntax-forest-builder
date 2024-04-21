@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.content.conversion

import space.yuvalinguist.npbloom.content.EntitySet
import space.yuvalinguist.npbloom.content.Id
import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.unpositioned.*
import space.yuvalinguist.npbloom.ui.content.generateNodeId
import space.yuvalinguist.npbloom.ui.content.generateTreeId
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName

private const val WORD_SEPARATOR = "   "  // This will be used to separate words in the resulting tree

fun TopDownTreeNode.toUnpositionedTree(): UnpositionedTree {
    val topDownNodeList: List<Pair<TopDownTreeNode, Id>> =
        toNodeList().let { it zip it.map { generateNodeId() } }

    val sentence = StringBuilder()
    val nodes = mutableListOf<UnpositionedNode>()
    topDownNodeList.forEach { (node, id) ->
        when (node) {
            is TopDownTreeTerminalNode -> {
                val wordSeparator = if (sentence.isNotEmpty()) WORD_SEPARATOR else ""
                val sliceStart = sentence.length + wordSeparator.length
                val sliceEndExclusive = sliceStart + node.content.length
                sentence.append(wordSeparator + node.content)
                nodes.add(
                    UnpositionedTerminalNode(
                        id,
                        node.label,
                        slice = StringSlice(sliceStart, sliceEndExclusive),
                        triangle = node.triangle,
                    )
                )
            }

            is TopDownTreeBranchingNode -> {
                val childIds =
                    node.children.map { child -> topDownNodeList.find { it.first == child }!!.second }.toSet()
                nodes.add(UnpositionedBranchingNode(id, node.label, children = childIds))
            }
        }
    }

    return UnpositionedTree(id = generateTreeId(), sentence = sentence.toString(), nodes = EntitySet(nodes))
}

fun TopDownTreeNode.toNodeList(): List<TopDownTreeNode> {
    val nodes = mutableListOf<TopDownTreeNode>()
    fun TopDownTreeNode.collectNodes() {
        if (this is TopDownTreeBranchingNode) children.forEach { it.collectNodes() }
        nodes.add(this)
    }
    collectNodes()
    return nodes.toList()
}

private fun UnpositionedTree.toTopDownTreeNode(nodeId: Id): TopDownTreeNode =
    when (val node = nodes[nodeId]!!) {
        is UnpositionedTerminalNode -> TopDownTreeTerminalNode(
            node.label,
            node.slice.contentInString(sentence),
            node.triangle,
        )

        is UnpositionedBranchingNode -> TopDownTreeBranchingNode(
            node.label,
            node.children.map { childId ->
                nodes[childId]
                    ?.let { toTopDownTreeNode(childId) }
                    ?: throw IllegalStateException("Child node with ID $childId not found")
            }
        )

        else -> TopDownTreeTerminalNode(node.label, content = " ", triangle = false)
    }

fun UnpositionedTree.toTopDownTree(): TopDownTreeNode {
    // Find the root node, which is the node for which...
    val root = nodes.find { node ->
        // ...there is no branching node that has it as a child
        nodes.none { otherNode ->
            otherNode is UnpositionedBranchingNode && otherNode.children.contains(node.id)
        }
    } ?: throw IllegalStateException("No root node found in tree")
    return toTopDownTreeNode(root.id)
}

@JsExport
fun treeToLbn(unpositionedTree: UnpositionedTree) = unpositionedTree.toTopDownTree().toLabelledBracketNotation()