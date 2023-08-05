/* Temporary helper functions to ease the transition to Kotlin. */

@file:OptIn(ExperimentalJsExport::class)

package content

import content.unpositioned.*

private fun jsOffsetRepr(offset: PlotCoordsOffset): dynamic =
    js("Object.fromEntries")(arrayOf(
        arrayOf("dPlotX", offset.dPlotX),
        arrayOf("dPlotY", offset.dPlotY),
    ))

private fun jsOffsetRepr(offset: TreeCoordsOffset): dynamic =
    js("Object.fromEntries")(arrayOf(
        arrayOf("dTreeX", offset.dTreeX),
        arrayOf("dTreeY", offset.dTreeY),
    ))

@JsExport
fun jsNodeRepr(node: UnpositionedNode): dynamic = js("Object.fromEntries")(when (node) {
    is UnpositionedBranchingNode -> arrayOf(
        arrayOf("children", node.children.toTypedArray()),
        arrayOf("label", node.label),
        arrayOf("offset", jsOffsetRepr(node.offset)),
    )

    is UnpositionedTerminalNode -> arrayOf(
        arrayOf("label", node.label),
        arrayOf("offset", jsOffsetRepr(node.offset)),
        arrayOf("slice", arrayOf(node.slice.start, node.slice.endExclusive)),
        arrayOf("triangle", node.triangle),
    )

    is UnpositionedFormerlyBranchingNode -> arrayOf(
        arrayOf("formerDescendants", jsNodeMapRepr(node.formerDescendants)),
        arrayOf("label", node.label),
        arrayOf("offset", jsOffsetRepr(node.offset)),
    )

    is UnpositionedFormerlyTerminalNode -> arrayOf(
        arrayOf("formerlyTriangle", node.formerlyTriangle),
        arrayOf("formerSlice", arrayOf(node.formerSlice.start, node.formerSlice.endExclusive)),
        arrayOf("label", node.label),
        arrayOf("offset", jsOffsetRepr(node.offset)),
    )

    is UnpositionedPlainStrandedNode -> arrayOf(
        arrayOf("label", node.label),
        arrayOf("offset", jsOffsetRepr(node.offset)),
    )
})

@JsExport
fun jsNodeMapRepr(idMap: IdMap<UnpositionedNode>): dynamic =
    js("Object.fromEntries")(idMap.map { (nodeId, node) -> arrayOf(nodeId, jsNodeRepr(node)) }.toTypedArray())

@JsExport
fun jsTreeRepr(tree: UnpositionedTree): dynamic =
    js("Object.fromEntries")(arrayOf(
        arrayOf("nodes", jsNodeMapRepr(tree.nodes)),
        arrayOf("offset", jsOffsetRepr(tree.offset)),
        arrayOf("sentence", tree.sentence),
    ))

@JsExport
fun jsTreeMapRepr(idMap: IdMap<UnpositionedTree>): dynamic =
    js("Object.fromEntries")(idMap.map { (treeId, tree) -> arrayOf(treeId, jsTreeRepr(tree)) }.toTypedArray())
