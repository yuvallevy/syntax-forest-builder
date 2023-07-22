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

export type UnpositionedFormerlyBranchingNode = NodeCommon & WithOffsetInTree & {
  formerDescendants: IdMap<UnpositionedNode>;
};

export type UnpositionedFormerlyTerminalNode = NodeCommon & WithOffsetInTree & {
  formerSlice: StringSlice;
  formerlyTriangle: boolean;
};

export type UnpositionedPlainStrandedNode = NodeCommon & WithOffsetInTree;

export type UnpositionedStrandedNode = UnpositionedFormerlyBranchingNode | UnpositionedFormerlyTerminalNode |
  UnpositionedPlainStrandedNode;

export type UnpositionedNode = UnpositionedBranchingNode | UnpositionedTerminalNode | UnpositionedStrandedNode;

export const isBranching = (node: UnpositionedNode): node is UnpositionedBranchingNode =>
  'children' in node;

export const isTerminal = (node: UnpositionedNode): node is UnpositionedTerminalNode =>
  'slice' in node;

export const isFormerlyBranching = (node: UnpositionedNode): node is UnpositionedFormerlyBranchingNode =>
  'formerDescendants' in node;

export const isFormerlyTerminal = (node: UnpositionedNode): node is UnpositionedFormerlyTerminalNode =>
  'formerSlice' in node;
