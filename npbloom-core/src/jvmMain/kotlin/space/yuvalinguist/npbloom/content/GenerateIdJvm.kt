package space.yuvalinguist.npbloom.content

import java.time.Instant

internal actual fun timeAsNumber() = Instant.now().toEpochMilli()
