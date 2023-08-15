@file:OptIn(ExperimentalJsExport::class)

package history

@JsExport
data class UndoRedoHistory<S, A : UndoableActionBase>(
    val applyActionFunc: (state: S, action: A) -> S,
    val reverseActionFunc: (action: A) -> A,
    val current: S,
    val undoStack: Array<A> = emptyArray(),
    val redoStack: Array<A> = emptyArray(),
) {
    val canUndo get() = undoStack.isNotEmpty()

    val canRedo get() = redoStack.isNotEmpty()

    fun applyAction(action: A): UndoRedoHistory<S, A> =
        copy(
            current = applyActionFunc(current, action),
            undoStack = arrayOf(action, *undoStack),
            redoStack = emptyArray(),
        )

    fun undo(): UndoRedoHistory<S, A> =
        if (this.canUndo) copy(
            current = applyActionFunc(current, reverseActionFunc(undoStack[0])),
            undoStack = undoStack.sliceArray(1 until undoStack.size),
            redoStack = arrayOf(undoStack[0], *redoStack),
        ) else this

    fun redo(): UndoRedoHistory<S, A> =
        if (this.canRedo) copy(
            current = applyActionFunc(current, redoStack[0]),
            undoStack = arrayOf(redoStack[0], *undoStack),
            redoStack = redoStack.sliceArray(1 until redoStack.size),
        ) else this

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (other == null || this::class.js != other::class.js) return false

        other as UndoRedoHistory<*, *>

        if (applyActionFunc != other.applyActionFunc) return false
        if (reverseActionFunc != other.reverseActionFunc) return false
        if (current != other.current) return false
        if (!undoStack.contentEquals(other.undoStack)) return false
        if (!redoStack.contentEquals(other.redoStack)) return false

        return true
    }

    override fun hashCode(): Int {
        var result = applyActionFunc.hashCode()
        result = 31 * result + reverseActionFunc.hashCode()
        result = 31 * result + (current?.hashCode() ?: 0)
        result = 31 * result + undoStack.contentHashCode()
        result = 31 * result + redoStack.contentHashCode()
        return result
    }
}

@JsExport
interface UndoableActionBase
