package ui.content

import content.IdMap
import content.StringSlice
import content.unpositioned.*
import ui.SliceSelectionInPlot
import kotlin.test.Test
import kotlin.test.assertEquals

class EditNodesTest {
    private val tree = UnpositionedTree(
        id = "pq6dLbe",
        "The dog jumped.",
        IdMap(
            UnpositionedBranchingNode("branch1", "NP", TreeCoordsOffset(0.0, 0.0), setOf("term1", "term2")),
            UnpositionedTerminalNode("term1", "Det", TreeCoordsOffset(0.0, 0.0), StringSlice(0, 3)),
            UnpositionedTerminalNode("term2", "N", TreeCoordsOffset(0.0, 0.0), StringSlice(4, 7)),
            UnpositionedTerminalNode("term3", "VP", TreeCoordsOffset(0.0, 0.0), StringSlice(8, 14), true),
            UnpositionedBranchingNode("top", "S", TreeCoordsOffset(0.0, 5.0), setOf("branch1", "term3")),
        ),
        PlotCoordsOffset(0.0, 0.0),
    )

    @Test
    fun newNodeFromSelectedWord() =
        assertEquals(
            InsertedTerminalNode("UE7q2t37", "", null, StringSlice(0, 4), triangle = false),
            newNodeFromSelection("UE7q2t37", SliceSelectionInPlot("YC38BV4q", StringSlice(0, 4)), "Alex baked cookies.")
        )

    @Test
    fun newNodeFromSelectedPhrase() =
        assertEquals(
            InsertedTerminalNode("I1cw913", "", null, StringSlice(5, 18), triangle = true),
            newNodeFromSelection("I1cw913", SliceSelectionInPlot("YC38BV4q", StringSlice(5, 18)), "Alex baked cookies.")
        )

    @Test
    fun newNodeFromZeroLengthSlice() =
        assertEquals(
            InsertedTerminalNode("v1M9Wei9", "", null, StringSlice(0, 4), triangle = false),
            newNodeFromSelection("v1M9Wei9", SliceSelectionInPlot("YC38BV4q", StringSlice(3, 3)), "Alex baked cookies.")
        )

    @Test
    fun handleLocalSentenceChange() =
        listOf(
            Triple("The dogs jumped.", StringSlice(7, 7), StringSlice(4, 7)),
            Triple("The wdog jumped.", StringSlice(4, 4), StringSlice(5, 8)),
            Triple("The doug jumped.", StringSlice(6, 6), StringSlice(4, 8)),
            Triple("The og jumped.", StringSlice(5, 5), StringSlice(4, 6)),  // Backward delete from index 5
            Triple("The og jumped.", StringSlice(4, 4), StringSlice(4, 6)),  // Forward delete from index 4
            Triple("The dg jumped.", StringSlice(6, 6), StringSlice(4, 6)),  // Backward delete from index 6
            Triple("The dg jumped.", StringSlice(5, 5), StringSlice(4, 6)),  // Forward delete from index 5
            Triple("The do jumped.", StringSlice(7, 7), StringSlice(4, 6)),  // Backward delete from index 7
            Triple("The do jumped.", StringSlice(6, 6), StringSlice(4, 6)),  // Forward delete from index 6
            Triple("The g jumped.", StringSlice(6, 6), StringSlice(4, 5)),  // Backward word delete from index 6
            Triple("The d jumped.", StringSlice(5, 5), StringSlice(4, 5)),  // Forward word delete from index 5
        ).map { (newSentence, oldSelection, newSlice) ->
            assertEquals(
                newSlice,
                (tree.handleLocalSentenceChange(newSentence, oldSelection)
                    .node("term2") as UnpositionedTerminalNode).slice
            )
        }
}
