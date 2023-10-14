package space.yuvalinguist.npbloom.history

data class TestState(
    val numberValue: Int,
    val stringValue: String,
)

sealed interface TestAction : UndoableActionBase

data class IncrementNumber(val difference: Int) : TestAction
data class DecrementNumber(val difference: Int) : TestAction
data class SetString(val oldValue: String, val newValue: String) : TestAction

fun testApplyAction(state: TestState, action: TestAction) =
    when (action) {
        is DecrementNumber -> state.copy(numberValue = state.numberValue - action.difference)
        is IncrementNumber -> state.copy(numberValue = state.numberValue + action.difference)
        is SetString -> state.copy(stringValue = action.newValue)
    }

fun testReverseAction(action: TestAction) =
    when (action) {
        is DecrementNumber -> IncrementNumber(action.difference)
        is IncrementNumber -> DecrementNumber(action.difference)
        is SetString -> action.copy(oldValue = action.newValue, newValue = action.oldValue)
    }
