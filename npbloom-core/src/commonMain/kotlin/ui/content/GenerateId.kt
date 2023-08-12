@file:OptIn(ExperimentalJsExport::class)

package ui.content

import kotlin.js.Date
import kotlin.random.Random
import kotlin.random.nextLong

private const val ID_TIME_LENGTH = 6
private const val ID_RANDOM_LENGTH = 4
private const val ID_BASE = 36

private val maxTimestamp = ("1" + "0".repeat(ID_TIME_LENGTH)).toLong(ID_BASE)
private val maxRandom = ("1" + "0".repeat(ID_RANDOM_LENGTH)).toLong(ID_BASE)

private fun generateId(prefix: String) =
    prefix +
            (Date().getTime().toInt() % maxTimestamp).toString(ID_BASE).padStart(ID_TIME_LENGTH, '0') +
            Random.nextLong(0 until maxRandom).toString(ID_BASE).padStart(ID_RANDOM_LENGTH, '0')

@JsExport
fun generateTreeId() = generateId("t")
@JsExport
fun generateNodeId() = generateId("n")
