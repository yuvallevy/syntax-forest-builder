import React, { useContext, useRef } from 'react';
import { Id, Sentence } from '../types';
import {
  AddNodeBySelection, formatSubscriptInString, generateNodeId, NodeSelectionAction, NodeSelectionInPlot, PositionedTree,
  Redo, RemoveTree, SelectionInPlot, SelectParentNodes, SetSelectedNodeSlice, SetSelection, SetSentence,
  SliceSelectionInPlot, StringSlice, Undo
} from 'npbloom-core';
import './SentenceView.scss';
import useUiState from '../useUiState';
import SettingsStateContext from '../SettingsStateContext';

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
  const { settingsState } = useContext(SettingsStateContext);

  const sentenceInputRef = useRef<HTMLInputElement>(null);

  const unpositionedPlot = state.contentState.current.plots[state.activePlotIndex];

  const setSelection = (newSelection: SelectionInPlot) => dispatch(new SetSelection(newSelection));
  const setNodeSlice = (newSlice: StringSlice) => dispatch(new SetSelectedNodeSlice(newSlice));
  const selectParentNodes = () => dispatch(new SelectParentNodes());
  const addNode = () => dispatch(new AddNodeBySelection(generateNodeId()));
  const undo = () => dispatch(new Undo());
  const redo = () => dispatch(new Redo());

  const handleSliceSelect = (slice: StringSlice) => {
    if (state.selectionAction === NodeSelectionAction.Adopt) {
      setNodeSlice(slice);
      // Reduce the selection to a zero-length slice,
      // so that after the input is blurred the selection can't be accidentally dragged
      sentenceInputRef.current?.setSelectionRange(sentenceInputRef.current.selectionEnd,
        sentenceInputRef.current.selectionEnd);
      // Blur the text field immediately to indicate that no slice actually becomes selected
      sentenceInputRef.current?.blur();
    } else {
      setSelection(new SliceSelectionInPlot(treeId, slice));
    }
  };

  const removeAndDeselectTree = (treeId: Id) => {
    dispatch(new RemoveTree(treeId));
    setSelection(NodeSelectionInPlot.Companion.fromArray([]));
  };

  const handleSentenceBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.currentTarget.value.trim() === '' && !unpositionedPlot.tree(treeId).hasNodes) {
      removeAndDeselectTree(treeId);
    }
  };

  const handleSentenceChange = (input: HTMLInputElement, newSentence: Sentence, oldSelectedSlice: StringSlice) => {
    dispatch(new SetSentence(newSentence, oldSelectedSlice));
    if (settingsState.autoFormatSubscript && input.selectionStart && input.selectionStart === input.selectionEnd) {
      const selectionBeforeAutoSubscript = input.selectionStart;
      const oldTextUpToSelection = newSentence.slice(0, selectionBeforeAutoSubscript);
      const newTextUpToSelection = formatSubscriptInString(oldTextUpToSelection);
      if (newTextUpToSelection) {
        setTimeout(() =>
          dispatch(new SetSentence(
            newTextUpToSelection + newSentence.slice(selectionBeforeAutoSubscript),
            new StringSlice(selectionBeforeAutoSubscript, selectionBeforeAutoSubscript)
          )), 100);
      }
    }
  };

  const handleSentenceKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowUp') {
      event.currentTarget.blur();
      if (state.selection instanceof SliceSelectionInPlot &&
        unpositionedPlot.tree(state.selection.treeId)
          .getNodeIdsAssignedToSlice(state.selection.slice).length === 0) {
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
    ref={sentenceInputRef}
    value={tree.sentence}
    className={'SentenceView--input' + (className ? ` ${className}` : '')}
    style={{
      left: tree.position.plotX,
      top: tree.position.plotY,
      width: tree.sentence.length === 0 ? EMPTY_SENTENCE_WIDTH : tree.width + EXTRA_SENTENCE_WIDTH,
    }}
    placeholder="Type a sentence..."
    onBlur={handleSentenceBlur}
    onInput={e => handleSentenceChange(e.currentTarget, e.currentTarget.value,
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
