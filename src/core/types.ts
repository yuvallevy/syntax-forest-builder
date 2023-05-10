export type Id = string;
export type Sentence = string;
export type NodeLabel = string;

type SliceStart = number;
type SliceEndExclusive = number;
type PlotX = number;
type PlotY = number;
type TreeX = number;
type TreeY = number;
type DPlotX = number;
type DPlotY = number;
type DTreeX = number;
type DTreeY = number;
type Width = number;

export type PlotCoords = {
  plotX: PlotX;
  plotY: PlotY;
};

export type PlotCoordsOffset = {
  dPlotX: DPlotX;
  dPlotY: DPlotY;
};

export type PlotRect = {
  topLeft: PlotCoords;
  bottomRight: PlotCoords;
};

export type StringSlice = [SliceStart, SliceEndExclusive];

export type IdMap<T> = Record<Id, T>;

export type TreeAndNodeId = {
  treeId: Id;
  nodeId: Id;
};

export type UnpositionedForest = { plots: IdMap<UnpositionedPlot>; };

export type UnpositionedPlot = { trees: IdMap<UnpositionedTree>; };

type TreeCommon = {
  sentence: Sentence;
}

export type UnpositionedTree = TreeCommon & {
  nodes: IdMap<UnpositionedNode>;
  offset: PlotCoordsOffset;
};

export type NodeCommon = {
  label: NodeLabel;
};

type WithOffsetInTree = {
  offset: {
    dTreeX: DTreeX;
    dTreeY: DTreeY;
  };
};

export type UnpositionedBranchingNode = NodeCommon & WithOffsetInTree & {
  children: Id[];
};

export type UnpositionedTerminalNode = NodeCommon & WithOffsetInTree & {
  slice: StringSlice;
  triangle: boolean;
};

export type UnpositionedStrandedNode = NodeCommon & WithOffsetInTree & {
  formerDescendants?: IdMap<UnpositionedNode>;
  formerSlice?: StringSlice;
  formerlyTriangle?: boolean;
};

export type UnpositionedNode = UnpositionedBranchingNode | UnpositionedTerminalNode | UnpositionedStrandedNode;

export const isBranching = (node: UnpositionedNode): node is UnpositionedBranchingNode =>
  'children' in node;

export const isTerminal = (node: UnpositionedNode): node is UnpositionedTerminalNode =>
  'slice' in node;

export type PositionInTree = {
  treeX: TreeX;
  treeY: TreeY;
};

type WithPositionInTree = { position: PositionInTree };

export type PositionedBranchingNode = NodeCommon & WithPositionInTree & {
  children: Id[];
};

export type PositionedTerminalNode = NodeCommon & WithPositionInTree & {
  slice: StringSlice;
  triangle?: {
    treeX1: TreeX;
    treeX2: TreeX;
  }
};

export type PositionedStrandedNode = NodeCommon & WithPositionInTree;

export type PositionedNode = PositionedBranchingNode | PositionedTerminalNode | PositionedStrandedNode;

export type PositionedTree = TreeCommon & {
  nodes: IdMap<PositionedNode>;
  position: PlotCoords;
  width: Width;
};

export type PositionedPlot = { trees: IdMap<PositionedTree> };
