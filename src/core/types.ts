export type Id = string;
export type Sentence = string;
type NodeLabel = string;

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

type IdMap<T> = Record<Id, T>;

export type UnpositionedForest = { plots: IdMap<UnpositionedPlot>; };

export type UnpositionedPlot = { trees: IdMap<UnpositionedTree>; };

type TreeCommon = {
  sentence: Sentence;
}

export type UnpositionedTree = TreeCommon & {
  nodes: IdMap<UnpositionedNode>;
  offset: { dPlotX: DPlotX; dPlotY: DPlotY; };
};

type NodeCommon = {
  label: NodeLabel;
};

type WithOffsetInTree = {
  offset: {
    dTreeX: DTreeX;
    dTreeY: DTreeY;
  };
};

type UnpositionedBranchingNode = NodeCommon & WithOffsetInTree & {
  children: IdMap<UnpositionedNode>;
};

type UnpositionedTerminalNode = NodeCommon & WithOffsetInTree & {
  slice: [SliceStart, SliceEndExclusive];
  triangle: boolean;
};

export type UnpositionedNode = UnpositionedBranchingNode | UnpositionedTerminalNode;

export type PositionInTree = {
  treeX: TreeX;
  treeY: TreeY;
};

type WithPositionInTree = { position: PositionInTree };

export type PositionedBranchingNode = NodeCommon & WithPositionInTree & {
  children: IdMap<PositionedNode>;
};

export type PositionedTerminalNode = NodeCommon & WithPositionInTree & {
  triangle?: {
    treeX1: TreeX;
    treeX2: TreeX;
  }
};

export type PositionedNode = PositionedBranchingNode | PositionedTerminalNode;

export type PositionedTree = TreeCommon & {
  nodes: IdMap<PositionedNode>;
  position: {
    plotX: PlotX;
    plotY: PlotY;
  }
};

export type PositionedPlot = { trees: IdMap<PositionedTree> };
