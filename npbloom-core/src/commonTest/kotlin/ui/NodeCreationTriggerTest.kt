package ui

import content.StringSlice
import content.positioned.*
import mockStrWidth
import kotlin.test.Test
import kotlin.test.assertContentEquals

class NodeCreationTriggerTest {
    private val positionedTree = PositionedTree(
        sentence = "Alex baked cookies.",
        nodes = mapOf(
            "aF3BLs" to PositionedTerminalNode("V", CoordsInTree(54.0, -2.0), StringSlice(5, 10), null),
            "X9M" to PositionedTerminalNode(
                "NP", CoordsInTree(101.0, -20.0), StringSlice(11, 18),
                TreeXRange(77.0, 125.0)
            ),
        ),
        position = CoordsInPlot(30.0, -10.0),
        width = 129.0,
    )

    @Test
    fun getNodeCreationTriggers() =
        assertContentEquals(
            arrayOf(
                BranchingNodeCreationTrigger(
                    origin = CoordsInTree(54.0, -42.0),
                    topLeft = CoordsInTree(38.0, -70.0),
                    bottomRight = CoordsInTree(70.0, -22.0),
                    childIds = setOf("aF3BLs"),
                    childPositions = arrayOf(CoordsInTree(54.0, -2.0))
                ),
                BranchingNodeCreationTrigger(
                    origin = CoordsInTree(101.0, -60.0),
                    topLeft = CoordsInTree(85.0, -88.0),
                    bottomRight = CoordsInTree(117.0, -40.0),
                    childIds = setOf("X9M"),
                    childPositions = arrayOf(CoordsInTree(101.0, -20.0))
                ),
                BranchingNodeCreationTrigger(
                    origin = CoordsInTree(77.5, -60.0),
                    topLeft = CoordsInTree(61.5, -88.0),
                    bottomRight = CoordsInTree(93.5, -40.0),
                    childIds = setOf("aF3BLs", "X9M"),
                    childPositions = arrayOf(CoordsInTree(54.0, -2.0), CoordsInTree(101.0, -20.0))
                ),
                TerminalNodeCreationTrigger(
                    origin = CoordsInTree(15.5, -20.0),
                    topLeft = CoordsInTree(-0.5, -48.0),
                    bottomRight = CoordsInTree(31.5, 0.0),
                    slice = StringSlice(0, 4)
                ),
            ),
            positionedTree.getNodeCreationTriggers(::mockStrWidth)
        )
}
