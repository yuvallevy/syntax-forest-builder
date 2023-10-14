@file:OptIn(ExperimentalJsExport::class)

package ui

import kotlin.js.ExperimentalJsExport
import kotlin.js.JsExport

// Moderately-long example words and names to make sure the click areas are large enough for untrained users
private val wordChoices = listOf(
    setOf("Alexis", "Maurice", "Nathan", "Taylor"),
    setOf("likes", "loves"),
    setOf("apples", "cabbage", "carrots", "parsley"),
)

/**
 * Returns an example sentence to build a first tree out of.
 */
@JsExport
fun generateSentence() = wordChoices.joinToString(" ") { it.random() }
