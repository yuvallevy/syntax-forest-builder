internal fun <T> Array<T>.insertAt(index: Int, newElement: T) =
    sliceArray(0 until index) + newElement + sliceArray(index until size)

internal fun <T> Array<T>.changeAt(index: Int, newElement: T) =
    sliceArray(0 until index) + newElement + sliceArray(index + 1 until size)

internal fun <T> Array<T>.removeAt(index: Int) =
    sliceArray(0 until index) + sliceArray(index + 1 until size)
