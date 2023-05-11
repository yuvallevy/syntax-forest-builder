export type Id = string;
export type Sentence = string;
export type NodeLabel = string;

type SliceStart = number;
type SliceEndExclusive = number;

export type StringSlice = [SliceStart, SliceEndExclusive];

export type IdMap<T> = Record<Id, T>;

export type NodeIndicatorInPlot = {
  treeId: Id;
  nodeId: Id;
};

export type TreeCommon = {
  sentence: Sentence;
}

export type NodeCommon = {
  label: NodeLabel;
};
