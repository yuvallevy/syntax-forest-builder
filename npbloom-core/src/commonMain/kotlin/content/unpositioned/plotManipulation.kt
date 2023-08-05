@file:OptIn(ExperimentalJsExport::class)

package content.unpositioned

import content.Id
import content.NodeIndicatorInPlot

/**
 * Returns the given list of tree and node IDs as a mapping from tree ID to node IDs.
 */
fun groupNodeIdsByTree(nodeIndicators: Set<NodeIndicatorInPlot>): Map<Id, Set<Id>> =
    nodeIndicators.groupBy { it.treeId }.mapValues { (_, nodeIndicators) -> nodeIndicators.map { it.nodeId }.toSet() }

/**
 * Returns a list of tree and node IDs referring to the parents of the given nodes.
 */
@JsExport
fun getParentNodeIdsInPlot(nodeIndicators: Set<NodeIndicatorInPlot>, plot: UnpositionedPlot): Set<NodeIndicatorInPlot> =
    groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
        getParentNodeIdsInTree(nodeIds, plot.trees[treeId]!!).map { NodeIndicatorInPlot(treeId, it) }
    }.toSet()

/**
 * Returns a list of tree and node IDs referring to the children of the given nodes.
 */
@JsExport
fun getChildNodeIdsInPlot(nodeIndicators: Set<NodeIndicatorInPlot>, plot: UnpositionedPlot): Set<NodeIndicatorInPlot> =
    groupNodeIdsByTree(nodeIndicators).flatMap { (treeId, nodeIds) ->
        getChildNodeIdsInTree(nodeIds, plot.trees[treeId]!!).map { NodeIndicatorInPlot(treeId, it) }
    }.toSet()

/**
 * Returns whether all given nodes are top-level nodes.
 */
@JsExport
fun allTopLevelInPlot(nodeIndicators: Set<NodeIndicatorInPlot>, plot: UnpositionedPlot): Boolean =
    getParentNodeIdsInPlot(nodeIndicators, plot).isEmpty()

/**
 * Transforms the nodes with the given indicators using the given transform function
 * at any point in any tree in the given plot.
 */
@JsExport
fun transformNodesInPlot(transformFunc: NodeTransformFunc, nodeIndicators: Set<NodeIndicatorInPlot>, plot: UnpositionedPlot): UnpositionedPlot =
    plot.copy(
        trees = plot.trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
            transformNodesInTree(transformFunc, nodeIds, plot.trees[treeId]!!)
        }
    )

/**
 * Deletes the nodes with the given indicators from the given plot.
 */
@JsExport
fun deleteNodesInPlot(nodeIndicators: Set<NodeIndicatorInPlot>, plot: UnpositionedPlot): UnpositionedPlot =
    plot.copy(
        trees = plot.trees + groupNodeIdsByTree(nodeIndicators).mapValues { (treeId, nodeIds) ->
            deleteNodesInTree(nodeIds, plot.trees[treeId]!!)
        }
    )
