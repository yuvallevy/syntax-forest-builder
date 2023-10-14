package space.yuvalinguist.npbloom.ui.content

import java.time.Instant

internal actual fun timeAsNumber() = Instant.now().toEpochMilli()
