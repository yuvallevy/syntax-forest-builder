import React, { useRef } from 'react';
import { Id, Sentence } from '../../types';
import { arrayFromSet, PositionedTree, StringSlice } from 'npbloom-core';
import './SentenceView.scss';
import { isEmpty } from '../../util/objTransforms';
import { isSliceSelection, SelectionInPlot } from '../selection';
import { generateNodeId } from '../content/generateId';
import useUiState from '../useUiState';

// A tree with no sentence will take up this width instead of 0 (or something close to 0):
const EMPTY_SENTENCE_WIDTH = 120;

// This will be added to the width of an input field determined by its content width, in case the width calculation is
// inaccurate for whatever reason
// (it doesn't allow placing one tree exactly at the end of another one, but that's not a common occurrence)
const EXTRA_SENTENCE_WIDTH = 4;

interface SentenceViewProps {
  tree: PositionedTree;
  treeId: Id;
  className?: string;
}

const getSelectionSlice = (element: HTMLInputElement): StringSlice | null =>
  element.selectionStart !== null && element.selectionEnd !== null
    ? new StringSlice(element.selectionStart, element.selectionEnd)
    : null;

const SentenceView: React.FC<SentenceViewProps> = ({
  tree,
  treeId,
  className,
}) => {
  const { state, dispatch } = useUiState();

  const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];

  const setSelection = (newSelection: SelectionInPlot) => dispatch({ type: 'setSelection', newSelection });
  const selectParentNodes = () => dispatch({ type: 'selectParentNodes' });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const handleSliceSelect = (slice: StringSlice) => setSelection({ treeId, slice });

  const removeAndDeselectTree = (treeId: Id) => {
    dispatch({ type: 'removeTree', treeId });
    setSelection({ nodeIndicators: [] });
  };

  const handleSentenceBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.trim() === '' && isEmpty(unpositionedPlot.trees[treeId].nodes)) {
      removeAndDeselectTree(treeId);
    }
  };

  const handleSentenceChange = (newSentence: Sentence, oldSelectedSlice: StringSlice) => dispatch({
    type: 'setSentence',
    newSentence,
    oldSelectedSlice,
  });

  const handleSentenceKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.currentTarget.blur();
      if (isSliceSelection(state.selection) &&
        arrayFromSet(unpositionedPlot.tree(state.selection.treeId).getNodeIdsAssignedToSlice(state.selection.slice).length === 0)) {
        addNode();
      } else {
        selectParentNodes();
      }
    } else if ((event.key === 'Backspace' || event.key === 'Delete') && event.currentTarget.value === '') {
      removeAndDeselectTree(treeId);
    } else if (event.key === 'z' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      undo();
    } else if (event.key === 'y' && (event.metaKey || event.ctrlKey)) {
      event.preventDefault();
      redo();
    }
  };

  // Keep track of the previous selection so we can report it whenever a change is made
  // (the input event only carries information about the *new* selection, hence this hack)
  const oldSelection = useRef<StringSlice | null>(null);

  return <input
    type="text"
    id={treeId}
    value={tree.sentence}
    className={'SentenceView--input' + (className ? ` ${className}` : '')}
    style={{
      left: tree.position.plotX,
      top: tree.position.plotY,
      width: tree.sentence.length === 0 ? EMPTY_SENTENCE_WIDTH : tree.width + EXTRA_SENTENCE_WIDTH,
    }}
    placeholder="Type a sentence..."
    onBlur={handleSentenceBlur}
    onInput={e => handleSentenceChange(e.currentTarget.value,
      oldSelection.current || new StringSlice(e.currentTarget.value.length, e.currentTarget.value.length))}
    onSelect={e => {
      const slice = getSelectionSlice(e.currentTarget);
      if (slice) handleSliceSelect(slice);
      oldSelection.current = getSelectionSlice(e.currentTarget);
    }}
    onKeyDown={handleSentenceKeyDown}
  />;
};

export default SentenceView;
