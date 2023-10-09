@file:OptIn(ExperimentalJsExport::class)

package history

@JsExport
data class UndoRedoHistory<S, A : UndoableActionBase>(
    val applyActionFunc: (state: S, action: A) -> S,
    val reverseActionFunc: (action: A) -> A,
    val current: S,
    val undoStack: List<A> = emptyList(),
    val redoStack: List<A> = emptyList(),
) {
    val canUndo get() = undoStack.isNotEmpty()

    val canRedo get() = redoStack.isNotEmpty()

    fun applyAction(action: A): UndoRedoHistory<S, A> =
        copy(
            current = applyActionFunc(current, action),
            undoStack = listOf(action) + undoStack,
            redoStack = emptyList(),
        )

    fun undo(): UndoRedoHistory<S, A> =
        if (this.canUndo) copy(
            current = applyActionFunc(current, reverseActionFunc(undoStack[0])),
            undoStack = undoStack.slice(1 until undoStack.size),
            redoStack = listOf(undoStack[0]) + redoStack,
        ) else this

    fun redo(): UndoRedoHistory<S, A> =
        if (this.canRedo) copy(
            current = applyActionFunc(current, redoStack[0]),
            undoStack = listOf(redoStack[0]) + undoStack,
            redoStack = redoStack.slice(1 until redoStack.size),
        ) else this
}

@JsExport
interface UndoableActionBase
