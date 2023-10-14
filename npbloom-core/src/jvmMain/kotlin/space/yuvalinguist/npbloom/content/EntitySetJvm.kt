package space.yuvalinguist.npbloom.content

internal actual fun <T> Collection<T>.toJsArray(): Array<T> =
    throw IllegalStateException("toJsArray should not be called from JVM code")
