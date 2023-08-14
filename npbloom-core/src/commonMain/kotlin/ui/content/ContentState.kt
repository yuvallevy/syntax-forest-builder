@file:OptIn(ExperimentalJsExport::class)

package ui.content

import changeAt
import content.Id
import content.NodeIndicatorInPlot
import content.Sentence
import content.StringSlice
import content.unpositioned.*
import history.UndoRedoHistory
import history.UndoableActionCommon
import insertAt
import removeAt

private typealias PlotIndex = Int

@JsExport
data class ContentState(val plots: Array<UnpositionedPlot>) {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class.js != other::class.js) return false

        other as ContentState

        if (!plots.contentEquals(other.plots)) return false

        return true
    }

    override fun hashCode() = plots.contentHashCode()

    override fun toString() =
        """ContentState(
    plots = arrayOf(${plots.joinToString()})
)"""
}

private val initialState = ContentState(arrayOf(UnpositionedPlot()))

internal sealed interface ContentOrHistoryAction

data object Undo : ContentOrHistoryAction
data object Redo : ContentOrHistoryAction

private sealed interface ContentAction : UndoableActionCommon, ContentOrHistoryAction

data object AddPlot : ContentAction
internal data class DeletePlot(val plotIndex: PlotIndex) : ContentAction
internal data class ResetPlot(val plotIndex: PlotIndex) : ContentAction
internal data class InsertNode(val plotIndex: PlotIndex, val treeId: Id, val newNodeId: Id, val newNode: InsertedNode) : ContentAction
internal data class DeleteNodes(val plotIndex: PlotIndex, val nodeIndicators: Set<NodeIndicatorInPlot>) : ContentAction
internal data class AdoptNodes(val plotIndex: PlotIndex, val treeId: Id, val adoptingNodeId: Id, val adoptedNodeIds: Set<Id>) : ContentAction
internal data class DisownNodes(val plotIndex: PlotIndex, val treeId: Id, val disowningNodeId: Id, val disownedNodeIds: Set<Id>) : ContentAction
internal data class MoveNodes(val plotIndex: PlotIndex, val nodeIndicators: Set<NodeIndicatorInPlot>, val offsetD: TreeCoordsOffset) : ContentAction
internal data class ResetNodePositions(val plotIndex: PlotIndex, val nodeIndicators: Set<NodeIndicatorInPlot>) : ContentAction
internal data class SetNodeLabel(val plotIndex: PlotIndex, val nodeIndicator: NodeIndicatorInPlot, val newLabel: String) : ContentAction
internal data class SetTriangle(val plotIndex: PlotIndex, val nodeIndicators: Set<NodeIndicatorInPlot>, val triangle: Boolean) : ContentAction
internal data class SetSentence(val plotIndex: PlotIndex, val treeId: Id, val newSentence: Sentence, val oldSelectedSlice: StringSlice) : ContentAction
internal data class AddTree(val plotIndex: PlotIndex, val newTreeId: Id, val offset: PlotCoordsOffset) : ContentAction
internal data class DeleteTree(val plotIndex: PlotIndex, val treeId: Id) : ContentAction

@JsExport
sealed interface ContentChange : UndoableActionCommon

internal data class PlotAdded(val newPlotIndex: PlotIndex, val newPlot: UnpositionedPlot) : ContentChange
internal data class PlotChanged(val plotIndex: PlotIndex, val old: UnpositionedPlot, val new: UnpositionedPlot) : ContentChange
internal data class PlotDeleted(val plotIndex: PlotIndex, val removedPlot: UnpositionedPlot) : ContentChange
internal data class TreeAdded(val plotIndex: PlotIndex, val newTreeId: Id, val newTree: UnpositionedTree) : ContentChange
internal data class TreeChanged(val plotIndex: PlotIndex, val treeId: Id, val old: UnpositionedTree, val new: UnpositionedTree) : ContentChange
internal data class TreeDeleted(val plotIndex: PlotIndex, val treeId: Id, val removedTree: UnpositionedTree) : ContentChange

private fun makeUndoable(state: ContentState, action: ContentAction): ContentChange = when (action) {
    AddPlot -> PlotAdded(state.plots.size, UnpositionedPlot())
    is DeletePlot -> PlotDeleted(action.plotIndex, state.plots[action.plotIndex])
    is ResetPlot -> PlotChanged(action.plotIndex, state.plots[action.plotIndex], UnpositionedPlot())
    is InsertNode -> TreeChanged(
        action.plotIndex,
        action.treeId,
        state.plots[action.plotIndex].tree(action.treeId),
        state.plots[action.plotIndex].tree(action.treeId).insertNode(action.newNode, action.newNodeId)
    )
    is DeleteNodes -> PlotChanged(
        action.plotIndex,
        state.plots[action.plotIndex],
        state.plots[action.plotIndex].deleteNodes(action.nodeIndicators)
    )
    is AdoptNodes -> TreeChanged(
        action.plotIndex,
        action.treeId,
        state.plots[action.plotIndex].tree(action.treeId),
        state.plots[action.plotIndex].tree(action.treeId).adoptNodes(action.adoptingNodeId, action.adoptedNodeIds)
    )
    is DisownNodes -> TreeChanged(
        action.plotIndex,
        action.treeId,
        state.plots[action.plotIndex].tree(action.treeId),
        state.plots[action.plotIndex].tree(action.treeId).disownNodes(action.disowningNodeId, action.disownedNodeIds)
    )
    is MoveNodes -> PlotChanged(
        action.plotIndex,
        state.plots[action.plotIndex],
        state.plots[action.plotIndex].transformNodes(action.nodeIndicators) { it.changeOffset(action.offsetD) }
    )
    is ResetNodePositions -> PlotChanged(
        action.plotIndex,
        state.plots[action.plotIndex],
        state.plots[action.plotIndex].transformNodes(action.nodeIndicators) { it.withOffset(TreeCoordsOffset.ZERO) }
    )
    is SetNodeLabel -> TreeChanged(
        action.plotIndex,
        action.nodeIndicator.treeId,
        state.plots[action.plotIndex].tree(action.nodeIndicator.treeId),
        state.plots[action.plotIndex].tree(action.nodeIndicator.treeId)
            .transformNode(action.nodeIndicator.nodeId) { it.withLabel(action.newLabel) }
    )
    is SetTriangle -> PlotChanged(
        action.plotIndex,
        state.plots[action.plotIndex],
        state.plots[action.plotIndex].transformNodes(
            action.nodeIndicators
        ) { if (it is UnpositionedTerminalNode) it.copy(triangle = action.triangle) else it }
    )
    is SetSentence -> TreeChanged(
        action.plotIndex,
        action.treeId,
        state.plots[action.plotIndex].tree(action.treeId),
        state.plots[action.plotIndex].tree(action.treeId)
            .handleLocalSentenceChange(action.newSentence, action.oldSelectedSlice)
    )
    is AddTree -> TreeAdded(action.plotIndex, action.newTreeId, UnpositionedTree("", emptyMap(), action.offset))
    is DeleteTree -> TreeDeleted(action.plotIndex, action.treeId, state.plots[action.plotIndex].tree(action.treeId))
}

private fun applyUndoableAction(state: ContentState, action: ContentChange): ContentState = when (action) {
    is PlotAdded -> state.copy(plots = state.plots.insertAt(action.newPlotIndex, action.newPlot))
    is PlotChanged -> state.copy(plots = state.plots.changeAt(action.plotIndex, action.new))
    is PlotDeleted -> state.copy(plots = state.plots.removeAt(action.plotIndex))
    is TreeAdded -> state.copy(plots = state.plots.changeAt(
        action.plotIndex,
        state.plots[action.plotIndex].setTree(action.newTreeId, action.newTree)
    ))
    is TreeChanged -> state.copy(plots = state.plots.changeAt(
        action.plotIndex,
        state.plots[action.plotIndex].setTree(action.treeId, action.new)
    ))
    is TreeDeleted -> state.copy(plots = state.plots.changeAt(
        action.plotIndex,
        state.plots[action.plotIndex].removeTree(action.treeId)
    ))
}

private fun reverseUndoableAction(action: ContentChange): ContentChange = when (action) {
    is PlotAdded -> PlotDeleted(action.newPlotIndex, action.newPlot)
    is PlotChanged -> action.copy(old = action.new, new = action.old)
    is PlotDeleted -> PlotAdded(action.plotIndex, action.removedPlot)
    is TreeAdded -> TreeDeleted(action.plotIndex, action.newTreeId, action.newTree)
    is TreeChanged -> action.copy(old = action.new, new = action.old)
    is TreeDeleted -> TreeAdded(action.plotIndex, action.treeId, action.removedTree)
}

typealias UndoableContentState = UndoRedoHistory<ContentState, ContentChange>

internal val initialContentState: UndoableContentState =
    UndoRedoHistory(::applyUndoableAction, ::reverseUndoableAction, initialState)

internal fun contentReducer(state: UndoableContentState, action: ContentOrHistoryAction): UndoableContentState = when (action) {
    Undo -> state.undo()
    Redo -> state.redo()
    is ContentAction -> state.applyAction(makeUndoable(state.current, action))
}
