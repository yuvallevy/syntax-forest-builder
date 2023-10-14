package ui.content

import content.EntitySet
import content.StringSlice
import content.YAlignMode
import content.unpositioned.*
import kotlin.test.Test
import kotlin.test.assertContentEquals
import kotlin.test.assertEquals

class SaveLoadTest {
    private val content = ContentState(
        listOf(
            UnpositionedPlot(
                trees = EntitySet(
                    UnpositionedTree(
                        id = "cleo",
                        sentence = "Cleo laughed.",
                        nodes = EntitySet(
                            UnpositionedBranchingNode("s1", "S", TreeCoordsOffset(0.0, 5.1), setOf("np1", "vp1")),
                            UnpositionedBranchingNode("np1", "NP", TreeCoordsOffset.ZERO, setOf("n1")),
                            UnpositionedTerminalNode("n1", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedTerminalNode(
                                "vp1",
                                "VP",
                                TreeCoordsOffset.ZERO,
                                StringSlice(5, 12),
                                yAlignMode = YAlignMode.Top
                            ),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                    UnpositionedTree(
                        id = "alex",
                        sentence = "Alex baked cookies.",
                        nodes = EntitySet(
                            UnpositionedBranchingNode("s2", "S", TreeCoordsOffset(0.0, 5.0), setOf("np2a", "vp2")),
                            UnpositionedBranchingNode("np2a", "NP", TreeCoordsOffset.ZERO, setOf("n2")),
                            UnpositionedTerminalNode("n2", "N", TreeCoordsOffset.ZERO, StringSlice(0, 4)),
                            UnpositionedBranchingNode("vp2", "VP", TreeCoordsOffset.ZERO, setOf("v2", "np2b")),
                            UnpositionedTerminalNode("v2", "V", TreeCoordsOffset.ZERO, StringSlice(5, 10)),
                            UnpositionedTerminalNode("np2b", "NP", TreeCoordsOffset.ZERO, StringSlice(11, 18)),
                        ),
                        offset = PlotCoordsOffset.ZERO,
                    ),
                ),
            )
        ))

    private val fileContents: ByteArray = byteArrayOf(
        89,  -79, 0,   17,  -16, 78,  87,  0,   1,   0,   -65, 97,  112, -97, -65, 97,
        116, -65, 97,  101, -97, -65, 97,  105, 100, 99,  108, 101, 111, 97,  115, 109,
        67,  108, 101, 111, 32,  108, 97,  117, 103, 104, 101, 100, 46,  97,  110, -65,
        97,  101, -97, -97, 97,  66,  -65, 97,  105, 98,  115, 49,  97,  108, 97,  83,
        97,  111, -97, -5,  0,   0,   0,   0,   0,   0,   0,   0,   -5,  64,  20,  102,
        102, 102, 102, 102, 102, -1,  97,  89,  -97, 99,  110, 112, 49,  99,  118, 112,
        49,  -1,  -1,  -1,  -97, 97,  66,  -65, 97,  105, 99,  110, 112, 49,  97,  108,
        98,  78,  80,  97,  89,  -97, 98,  110, 49,  -1,  -1,  -1,  -97, 97,  84,  -65,
        97,  105, 98,  110, 49,  97,  108, 97,  78,  97,  115, -97, 0,   4,   -1,  -1,
        -1,  -97, 97,  84,  -65, 97,  105, 99,  118, 112, 49,  97,  108, 98,  86,  80,
        97,  115, -97, 5,   12,  -1,  97,  45,  97,  94,  -1,  -1,  -1,  -1,  -1,  -65,
        97,  105, 100, 97,  108, 101, 120, 97,  115, 115, 65,  108, 101, 120, 32,  98,
        97,  107, 101, 100, 32,  99,  111, 111, 107, 105, 101, 115, 46,  97,  110, -65,
        97,  101, -97, -97, 97,  66,  -65, 97,  105, 98,  115, 50,  97,  108, 97,  83,
        97,  111, -97, -5,  0,   0,   0,   0,   0,   0,   0,   0,   -5,  64,  20,  0,
        0,   0,   0,   0,   0,   -1,  97,  89,  -97, 100, 110, 112, 50,  97,  99,  118,
        112, 50,  -1,  -1,  -1,  -97, 97,  66,  -65, 97,  105, 100, 110, 112, 50,  97,
        97,  108, 98,  78,  80,  97,  89,  -97, 98,  110, 50,  -1,  -1,  -1,  -97, 97,
        84,  -65, 97,  105, 98,  110, 50,  97,  108, 97,  78,  97,  115, -97, 0,   4,
        -1,  -1,  -1,  -97, 97,  66,  -65, 97,  105, 99,  118, 112, 50,  97,  108, 98,
        86,  80,  97,  89,  -97, 98,  118, 50,  100, 110, 112, 50,  98,  -1,  -1,  -1,
        -97, 97,  84,  -65, 97,  105, 98,  118, 50,  97,  108, 97,  86,  97,  115, -97,
        5,   10,  -1,  -1,  -1,  -97, 97,  84,  -65, 97,  105, 100, 110, 112, 50,  98,
        97,  108, 98,  78,  80,  97,  115, -97, 11,  18,  -1,  -1,  -1,  -1,  -1,  -1,
        -1,  -1,  -1,  -1,  -1,
    )

    @Test
    fun toFileContents() {
        assertContentEquals(fileContents, content.toFileContents())
    }

    @Test
    fun fromFileContents() {
        assertEquals(content, ContentState.fromFileContents(fileContents))
    }
}
