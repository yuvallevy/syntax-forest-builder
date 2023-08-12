import { ContentChange, ContentState, UndoRedoHistory } from 'npbloom-core';

export type Id = string;
export type IdMap<T> = Record<Id, T>
export type Sentence = string;
export type PlotIndex = number;
export type NodeLabel = string;
export type UndoableContentState = UndoRedoHistory<ContentState, ContentChange>;
