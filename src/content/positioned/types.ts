import { Id, IdMap, NodeCommon, StringSlice, TreeCommon } from '../types';

type PlotX = number;
type PlotY = number;
type TreeX = number;
type TreeY = number;
type Width = number;

export type PlotCoords = {
  plotX: PlotX;
  plotY: PlotY;
};

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
