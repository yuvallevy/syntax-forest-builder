package space.yuvalinguist.npbloom

internal fun <T> List<T>.insertAt(index: Int, newElement: T) =
    slice(0 until index) + newElement + slice(index until size)

internal fun <T> List<T>.changeAt(index: Int, newElement: T) =
    slice(0 until index) + newElement + slice(index + 1 until size)

internal fun <T> List<T>.removeAt(index: Int) =
    slice(0 until index) + slice(index + 1 until size)
