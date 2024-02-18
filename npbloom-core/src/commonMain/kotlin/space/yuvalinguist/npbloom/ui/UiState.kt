@file:OptIn(ExperimentalJsExport::class)
@file:Suppress("CanSealedSubClassBeObject")

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.*
import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import space.yuvalinguist.npbloom.content.positioned.StrWidthFunc
import space.yuvalinguist.npbloom.content.positioned.sortNodesByXCoord
import space.yuvalinguist.npbloom.content.unpositioned.*
import space.yuvalinguist.npbloom.mockStrWidth
import space.yuvalinguist.npbloom.ui.content.*
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

private typealias PlotIndex = Int

@JsExport
sealed interface UiAction

@JsExport
enum class ChildNodeSide { Left, Right, Center }

@JsExport class SetActivePlotIndex(val newPlotIndex: PlotIndex) : UiAction
@JsExport class AddPlot : UiAction
@JsExport class DeletePlot(val plotIndex: PlotIndex) : UiAction
@JsExport class SetSelection(val newSelection: SelectionInPlot) : UiAction
@JsExport class SelectParentNodes : UiAction
@JsExport class SelectChildNode(val side: ChildNodeSide) : UiAction
@JsExport class StartEditing : UiAction
@JsExport class StopEditing : UiAction
@JsExport class SetEditedNodeLabel(val newLabel: NodeLabel) : UiAction
@JsExport class SetSelectionAction(val selectionAction: EntitySelectionAction) : UiAction
@JsExport class AddNodeBySelection(val newNodeId: Id) : UiAction
@JsExport class AddBranchingNodeByTarget(val treeId: Id, val newNodeId: Id, val targetChildIds: Array<Id>) : UiAction
@JsExport class AddTerminalNodeByTarget(
    val treeId: Id,
    val newNodeId: Id,
    val targetSlice: StringSlice,
    val triangle: Boolean
) : UiAction

@JsExport class DeleteSelectedEntities : UiAction
@JsExport class AdoptNodesBySelection(val adoptedNodeIndicators: Array<NodeIndicatorInPlot>) : UiAction
@JsExport class DisownNodesBySelection(val disownedNodeIndicators: Array<NodeIndicatorInPlot>) : UiAction
@JsExport class SetSelectedNodeSlice(val newSlice: StringSlice) : UiAction
@JsExport class MoveSelectedNodes(val dx: Double, val dy: Double) : UiAction
@JsExport class MoveSelectedTrees(val dx: Double, val dy: Double) : UiAction
@JsExport class ResetSelectedNodePositions : UiAction
@JsExport class ToggleTriangle : UiAction
@JsExport class SetSentence(val newSentence: Sentence, val oldSelectedSlice: StringSlice, val treeId: Id? = null) : UiAction
@JsExport class AddTree(val newTreeId: Id, val coordsInPlot: CoordsInPlot) : UiAction
@JsExport class RemoveTree(val treeId: Id) : UiAction
@JsExport class Undo : UiAction
@JsExport class Redo : UiAction
@JsExport class LoadContentState(val contentState: ContentState) : UiAction
@JsExport class Pan(val clientCoordsOffset: ClientCoordsOffset) : UiAction
@JsExport class Zoom(val relativeFactor: Double, val focus: CoordsInClient) : UiAction

@JsExport
data class UiState(
    val contentState: UndoableContentState,
    val activePlotIndex: PlotIndex,
    val selection: SelectionInPlot,
    val selectionAction: EntitySelectionAction,
    val editedNodeIndicator: NodeIndicatorInPlot?,
    val panZoomState: PanZoomState,
)

@JsExport
val initialUiState = UiState(
    activePlotIndex = 0,
    contentState = initialContentState,
    selection = NoSelectionInPlot,
    selectionAction = EntitySelectionAction.SelectNode,
    editedNodeIndicator = null,
    panZoomState = PanZoomState(PlotCoordsOffset(0.0, 0.0), 1.0)
)

private fun selectParentNodes(activePlot: UnpositionedPlot, selection: SelectionInPlot): SelectionInPlot =
    when (selection) {
        is SliceSelectionInPlot -> activePlot.tree(selection.treeId).getNodeIdsAssignedToSlice(selection.slice)
            .map { nodeId -> NodeIndicatorInPlot(selection.treeId, nodeId) }.asSelectionInPlot()

        is NodeSelectionInPlot -> when {
            selection.nodeIndicators.isEmpty() -> selection
            else -> activePlot.getParentNodeIds(selection.nodeIndicators).asSelectionInPlot()
        }

        else -> selection
    }

@JsExport
fun uiReducer(state: UiState, action: UiAction, strWidthFunc: StrWidthFunc): UiState {
    val activePlot = state.contentState.current.plots[state.activePlotIndex]
    val selectedTreeId = when {
        state.selection is SliceSelectionInPlot -> state.selection.treeId
        state.selection is NodeSelectionInPlot && state.selection.nodeIndicators.isNotEmpty() ->
            state.selection.nodeIndicators.toList()[0].treeId

        else -> null
    }
    when (action) {
        is SetActivePlotIndex -> {
            return state.copy(
                activePlotIndex = action.newPlotIndex,
                selection = NoSelectionInPlot,
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = null,
            )
        }

        is AddPlot -> {
            return state.copy(
                contentState = contentReducer(state.contentState, AddPlot),
                activePlotIndex = state.contentState.current.plots.size,
                selection = NoSelectionInPlot,
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = null,
            )
        }

        is DeletePlot -> {
            val isLastRemainingPlot = state.contentState.current.plots.size == 1
            val newContentState =
                if (isLastRemainingPlot) contentReducer(state.contentState, ResetPlot(action.plotIndex))
                else contentReducer(state.contentState,
                    space.yuvalinguist.npbloom.ui.content.DeletePlot(action.plotIndex))
            val newActivePlotIndex =
                if (state.activePlotIndex < newContentState.current.plots.size) state.activePlotIndex
                else newContentState.current.plots.size - 1
            return state.copy(
                contentState = newContentState,
                activePlotIndex = newActivePlotIndex,
                selection = NoSelectionInPlot,
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = null,
            )
        }

        is SetSelection -> {
            return state.copy(
                selection = action.newSelection,
                selectionAction =
                if (state.selectionAction == EntitySelectionAction.SelectTree) EntitySelectionAction.SelectTree
                else EntitySelectionAction.SelectNode,
            )
        }

        is SelectParentNodes -> {
            val parentSelection = selectParentNodes(activePlot, state.selection)
            if (parentSelection !is NodeSelectionInPlot) return state
            return state.copy(
                selection = parentSelection,
                editedNodeIndicator = if (state.editedNodeIndicator != null) parentSelection.nodeIndicators.toList()[0]
                else null,
            )
        }

        is SelectChildNode -> {
            if (
                state.selection !is NodeSelectionInPlot ||  // no nodes selected
                state.selection.nodeIndicators.size != 1 ||  // multiple nodes selected
                selectedTreeId == null  // could not figure out tree ID for some other reason
            ) return state
            val selectedNodeObject = activePlot.tree(selectedTreeId)
                .node(state.selection.nodeIndicators.single().nodeId)
            if (selectedNodeObject !is UnpositionedBranchingNode) return state

            val selectedNodeChildren = selectedNodeObject.children
            val childNodesSortedByX =
                sortNodesByXCoord(strWidthFunc, activePlot.tree(selectedTreeId), selectedNodeObject.children)

            val childSelection: NodeSelectionInPlot =
                when {
                    action.side == ChildNodeSide.Center && selectedNodeChildren.size == 1 ->
                        NodeSelectionInPlot(setOf(NodeIndicatorInPlot(selectedTreeId, childNodesSortedByX[0])))

                    action.side == ChildNodeSide.Center && selectedNodeChildren.size >= 3 ->
                        NodeSelectionInPlot(setOf(NodeIndicatorInPlot(selectedTreeId, childNodesSortedByX[1])))

                    action.side != ChildNodeSide.Center && selectedNodeChildren.size >= 2 ->
                        NodeSelectionInPlot(
                            setOf(
                                NodeIndicatorInPlot(
                                    selectedTreeId,
                                    childNodesSortedByX[if (action.side === ChildNodeSide.Left) 0 else (selectedNodeChildren.size - 1)]
                                )
                            )
                        )

                    else -> null
                } ?: return state

            return state.copy(
                selection = childSelection,
                editedNodeIndicator = if (state.editedNodeIndicator != null) childSelection.nodeIndicators.toList()[0]
                else null,
            )
        }

        is StartEditing -> {
            return if (state.selection !is NodeSelectionInPlot || state.selection.nodeIndicators.size != 1) state
            else state.copy(
                editedNodeIndicator = state.selection.nodeIndicators.single(),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is StopEditing -> {
            return state.copy(editedNodeIndicator = null)
        }

        is SetEditedNodeLabel -> {
            if (state.editedNodeIndicator == null) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState,
                    SetNodeLabel(state.activePlotIndex, state.editedNodeIndicator, action.newLabel)
                )
            )
        }

        is SetSelectionAction -> {
            if (state.selectionAction === EntitySelectionAction.SelectTree)
                return state.copy(selection = NoSelectionInPlot, selectionAction = action.selectionAction)
            return state.copy(selectionAction = action.selectionAction)
        }

        is AddNodeBySelection -> {
            if (selectedTreeId == null) return state
            val newNodeIndicator = NodeIndicatorInPlot(selectedTreeId, action.newNodeId)
            return state.copy(
                contentState = contentReducer(
                    state.contentState, InsertNode(
                        state.activePlotIndex,
                        selectedTreeId,
                        newNodeFromSelection(
                            action.newNodeId,
                            state.selection,
                            activePlot.tree(selectedTreeId).sentence
                        ),
                    )
                ),
                selection = NodeSelectionInPlot(setOf(newNodeIndicator)),
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = newNodeIndicator,
            )
        }

        is AddBranchingNodeByTarget -> {
            val newNodeIndicator = NodeIndicatorInPlot(action.treeId, action.newNodeId)
            return state.copy(
                contentState = contentReducer(
                    state.contentState, InsertNode(
                        state.activePlotIndex,
                        action.treeId,
                        InsertedBranchingNode(action.newNodeId, "", null, action.targetChildIds.toSet()),
                    )
                ),
                selection = NodeSelectionInPlot(setOf(newNodeIndicator)),
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = newNodeIndicator,
            )
        }

        is AddTerminalNodeByTarget -> {
            val newNodeIndicator = NodeIndicatorInPlot(action.treeId, action.newNodeId)
            return state.copy(
                contentState = contentReducer(
                    state.contentState, InsertNode(
                        state.activePlotIndex,
                        action.treeId,
                        InsertedTerminalNode(action.newNodeId, "", null, action.targetSlice, action.triangle),
                    )
                ),
                selection = NodeSelectionInPlot(setOf(newNodeIndicator)),
                selectionAction = EntitySelectionAction.SelectNode,
                editedNodeIndicator = newNodeIndicator,
            )
        }

        is DeleteSelectedEntities -> {
            return when (state.selection) {
                is NodeSelectionInPlot -> state.copy(
                    contentState = contentReducer(
                        state.contentState,
                        DeleteNodes(state.activePlotIndex, state.selection.nodeIndicators)
                    ),
                    selection =
                    // Currently selected nodes are about to be deleted, so they should not be selected after deletion
                    // (this can happen when two deleted nodes are parent and child)
                    (activePlot.getChildNodeIds(state.selection.nodeIndicators) - state.selection.nodeIndicators)
                        .asSelectionInPlot(),
                    selectionAction = EntitySelectionAction.SelectNode,
                )

                is TreeSelectionInPlot -> state.copy(
                    contentState = contentReducer(
                        state.contentState,
                        DeleteTrees(state.activePlotIndex, state.selection.treeIds)
                    ),
                    selection = NoSelectionInPlot,
                    selectionAction = EntitySelectionAction.SelectTree,
                )

                else -> state
            }
        }

        is AdoptNodesBySelection -> {
            if (
                state.selection !is NodeSelectionInPlot ||  // no nodes selected
                state.selection.nodeIndicators.size != 1 ||  // multiple nodes selected
                selectedTreeId == null  // could not figure out tree ID for some other reason
            ) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState,
                    AdoptNodes(
                        state.activePlotIndex,
                        selectedTreeId,
                        state.selection.nodeIndicators.single().nodeId,
                        action.adoptedNodeIndicators.filter { it.treeId == selectedTreeId }.map { it.nodeId }.toSet()
                    ),
                ),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is DisownNodesBySelection -> {
            if (
                state.selection !is NodeSelectionInPlot ||  // no nodes selected
                state.selection.nodeIndicators.size != 1 ||  // multiple nodes selected
                selectedTreeId == null  // could not figure out tree ID for some other reason
            ) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState,
                    DisownNodes(
                        state.activePlotIndex,
                        selectedTreeId,
                        state.selection.nodeIndicators.single().nodeId,
                        action.disownedNodeIndicators.filter { it.treeId == selectedTreeId }.map { it.nodeId }.toSet()
                    ),
                ),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is SetSelectedNodeSlice -> {
            if (
                state.selection !is NodeSelectionInPlot ||  // no nodes selected
                state.selection.nodeIndicators.size != 1 ||  // multiple nodes selected
                selectedTreeId == null  // could not figure out tree ID for some other reason
            ) return state
            val sentence = activePlot.tree(selectedTreeId).sentence
            val newSliceAfterSpread = spreadSlice(action.newSlice, sentence)
            return state.copy(
                contentState = contentReducer(
                    state.contentState, SetNodeSlice(
                        state.activePlotIndex,
                        state.selection.nodeIndicators.single(),
                        newSliceAfterSpread,
                        newSliceAfterSpread crossesWordBoundaryIn sentence
                    )
                ),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is MoveSelectedNodes -> {
            if (state.selection !is NodeSelectionInPlot) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState, MoveNodes(
                        state.activePlotIndex,
                        state.selection.nodeIndicators,
                        TreeCoordsOffset(action.dx, action.dy),
                    )
                ),
            )
        }

        is MoveSelectedTrees -> {
            if (state.selection !is TreeSelectionInPlot) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState, MoveTrees(
                        state.activePlotIndex,
                        state.selection.treeIds,
                        PlotCoordsOffset(action.dx, action.dy),
                    )
                ),
            )
        }

        is ResetSelectedNodePositions -> {
            if (state.selection !is NodeSelectionInPlot) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState, ResetNodePositions(
                        state.activePlotIndex,
                        state.selection.nodeIndicators,
                    )
                ),
            )
        }

        is ToggleTriangle -> {
            if (state.selection !is NodeSelectionInPlot) return state
            val currentlyTriangle = state.selection.nodeIndicators.all { (treeId, nodeId) ->
                val node = activePlot.tree(treeId).node(nodeId)
                if (node is UnpositionedTerminalNode) node.triangle else false
            }
            return state.copy(
                contentState = contentReducer(
                    state.contentState,
                    SetTriangle(
                        state.activePlotIndex,
                        state.selection.nodeIndicators,
                        !currentlyTriangle,
                    )
                ),
            )
        }

        is SetSentence -> {
            if (selectedTreeId == null) return state
            return state.copy(
                contentState = contentReducer(
                    state.contentState, SetSentence(
                        state.activePlotIndex,
                        action.treeId ?: selectedTreeId,
                        action.newSentence,
                        action.oldSelectedSlice,
                    )
                ),
            )
        }

        is AddTree -> {
            return state.copy(
                contentState = contentReducer(
                    state.contentState, AddTree(
                        state.activePlotIndex,
                        action.newTreeId,
                        action.coordsInPlot,
                    )
                ),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is RemoveTree -> {
            return state.copy(
                contentState = contentReducer(
                    state.contentState, DeleteTree(
                        state.activePlotIndex,
                        action.treeId,
                    )
                ),
                selectionAction = EntitySelectionAction.SelectNode,
            )
        }

        is Undo, is Redo -> {
            val newContentState = contentReducer(state.contentState, if (action is Undo) Undo else Redo)
            val newActivePlotIndex =
                if (state.activePlotIndex < newContentState.current.plots.size) state.activePlotIndex
                else newContentState.current.plots.size - 1
            return state.copy(
                contentState = newContentState,
                activePlotIndex = newActivePlotIndex,
                selection = pruneSelection(state.selection, newContentState.current.plots[newActivePlotIndex]),
            )
        }

        is LoadContentState ->
            return initialUiState.copy(
                contentState = initialContentState.copy(current = action.contentState)
            )

        is Pan -> {
            return state.copy(panZoomState = state.panZoomState.panBy(action.clientCoordsOffset))
        }

        is Zoom -> {
            return state.copy(panZoomState = state.panZoomState.zoom(action.relativeFactor, action.focus.toOffset()))
        }
    }
}
