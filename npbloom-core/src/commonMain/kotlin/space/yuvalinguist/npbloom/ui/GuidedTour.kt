@file:OptIn(ExperimentalJsExport::class)

package space.yuvalinguist.npbloom.ui

import space.yuvalinguist.npbloom.content.StringSlice
import space.yuvalinguist.npbloom.content.positioned.CoordsInPlot
import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport
import kotlin.js.JsName
import kotlin.math.round

private fun mockStrWidthFunc(str: String) = str.length * 10.0

@JsExport
data class GuidedTourStep(
    val id: String,
    val title: String,
    val body: String,
    @JsName("actionsAsKtList") val actions: List<UiAction> = emptyList(),
) {
    @JsName("actions")
    val actionsAsArray = actions.toTypedArray()
}

/**
 * Returns the result of applying all the actions in the guided tour steps up to (but not including) the step with the given ID.
 * This is used to set the content state for each step in the guided tour demo.
 */
@JsExport
fun applyTourStepsUpTo(stepId: String, treeCoordsInPlot: CoordsInPlot): UiState {
    val stepIndex = guidedTourSteps(treeCoordsInPlot).indexOfFirst { it.id == stepId }
    return guidedTourSteps(treeCoordsInPlot)
        .take(stepIndex)
        .flatMap { it.actions }
        .also { println("Applying actions for steps up to '$stepId': $it") }
        .fold(initialUiState) { state, action -> uiReducer(state, action, ::mockStrWidthFunc) }
        .copy(editedNodeIndicator = null, selection = NoSelectionInPlot)
}

@JsExport
fun guidedTourSteps(treeCoordsInPlot: CoordsInPlot = CoordsInPlot.ZERO) = arrayOf(
    GuidedTourStep(
        id = "plant-tree",
        title = "Plant your first tree",
        body = "Click anywhere and enter a sentence.",
        actions = listOf(
            AddTree("tour", treeCoordsInPlot),
            SetSentence("I drew this tree.", StringSlice(0, 0), "tour"),
        ),
    ),
    GuidedTourStep(
        id = "add-first-node",
        title = "Add your first node",
        body = "Click above any of the words to add a node for it.",
        actions = listOf(
            AddTerminalNodeByTarget("tour", "tourN1", StringSlice(0, 1), false),
            SetEditedNodeLabel("N"),
            AddTerminalNodeByTarget("tour", "tourV", StringSlice(2, 6), false),
            SetEditedNodeLabel("V"),
            AddTerminalNodeByTarget("tour", "tourDet", StringSlice(7, 11), false),
            SetEditedNodeLabel("Det"),
            AddTerminalNodeByTarget("tour", "tourN2", StringSlice(12, 16), false),
            SetEditedNodeLabel("N"),
        ),
    ),
    GuidedTourStep(
        id = "add-parent-nodes",
        title = "Give them parents",
        body = "Click above a node to add a parent node for it.",
        actions = listOf(
            AddBranchingNodeByTarget("tour", "tourNP1", arrayOf("tourN1")),
            SetEditedNodeLabel("NP"),
        ),
    ),
    GuidedTourStep(
        id = "add-branching-nodes",
        title = "Branch out",
        body = "Click above the space between two adjacent nodes to add a parent node for both of them.",
        actions = listOf(
            AddBranchingNodeByTarget("tour", "tourNP2", arrayOf("tourDet", "tourN2")),
            SetEditedNodeLabel("NP"),
        ),
    ),
    GuidedTourStep(
        id = "complete-tree",
        title = "Up we go!",
        body = "Continue adding nodes until the tree is complete.",
        actions = listOf(
            AddBranchingNodeByTarget("tour", "tourVP", arrayOf("tourV", "tourNP2")),
            SetEditedNodeLabel("VP"),
            AddBranchingNodeByTarget("tour", "tourS", arrayOf("tourNP1", "tourVP")),
            SetEditedNodeLabel("S"),
        ),
    ),
    GuidedTourStep(
        id = "thats-it",
        title = "That's it!",
        body = "Have fun!",
    ),
)