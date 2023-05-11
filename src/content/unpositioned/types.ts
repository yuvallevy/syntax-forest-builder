import { Id, IdMap, NodeCommon, StringSlice, TreeCommon } from '../types';

type DPlotX = number;
type DPlotY = number;
type DTreeX = number;
type DTreeY = number;

export type PlotCoordsOffset = {
  dPlotX: DPlotX;
  dPlotY: DPlotY;
};

export type UnpositionedPlot = { trees: IdMap<UnpositionedTree>; };

export type UnpositionedTree = TreeCommon & {
  nodes: IdMap<UnpositionedNode>;
  offset: PlotCoordsOffset;
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
