import { ActionIcon, Paper, SimpleGrid, useMantineTheme } from '@mantine/core';
import {
  IconArrowBackUp, IconArrowForwardUp, IconPencil, IconPlus, IconTrash, IconTriangle, TablerIconsProps
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import './Toolbox.scss';
import substituteOsAwareHotkey from './substituteOsAwareHotkey';
import { useOs } from '@mantine/hooks';
import { canRedo, canUndo } from '../uiState';
import { IconAdoptNode, IconDisownNode, IconResetNodePosition } from './icons';
import useUiState from '../useUiState';
import { isNodeSelection } from '../selection';
import { generateNodeId } from '../content/generateId';
import { isTerminal, UnpositionedTerminalNode } from '../../content/unpositioned/types';

type ToolboxItem = {
  title: string;
  icon?: (props: TablerIconsProps) => JSX.Element;
  action: (event: React.UIEvent, focusEvent?: React.FocusEvent) => void;
  disabled?: boolean;
  toggleState?: 'on' | 'off' | 'indeterminate';
  hotkey?: string;
  description: string;
};

const Toolbox: React.FC = () => {
  const { state, dispatch } = useUiState();

  const nothingSelected = isNodeSelection(state.selection) && state.selection.nodeIndicators.length === 0;
  const noNodesSelected = !isNodeSelection(state.selection) || state.selection.nodeIndicators.length === 0;
  const selectedNodeIndicators = isNodeSelection(state.selection) ? state.selection.nodeIndicators : [];
  const selectedNodeObjects = selectedNodeIndicators.map(({ treeId, nodeId }) =>
    state.contentState.current.plots[state.activePlotIndex].trees[treeId].nodes[nodeId]);

  const startEditing = () => dispatch({ type: 'startEditing' });
  const addNode = () => dispatch({ type: 'addNodeBySelection', newNodeId: generateNodeId() });
  const deleteNode = () => dispatch({ type: 'deleteSelectedNodes' });
  const resetNodePositions = () => dispatch({ type: 'resetSelectedNodePositions' });
  const toggleTriangle = (wasEditing: boolean) => {
    dispatch({ type: 'toggleTriangle' });
    wasEditing && setTimeout(startEditing, 50);  // Hack to restore focus to edited node when clicking the triangle button.
  };
  const toggleAdoptMode = () => dispatch({ type: 'setSelectionAction',
    selectionAction: state.selectionAction === 'adopt' ? 'select' : 'adopt' });
  const toggleDisownMode = () => dispatch({ type: 'setSelectionAction',
    selectionAction: state.selectionAction === 'disown' ? 'select' : 'disown' });
  const undo = () => dispatch({ type: 'undo' });
  const redo = () => dispatch({ type: 'redo' });

  const os = useOs();

  const [hoveredItem, setHoveredItem] = useState<ToolboxItem>();

  const lastFocusEvent = useRef<React.FocusEvent>();

  const theme = useMantineTheme();

  const getTriangleButtonState = (): { toggleState: 'on' | 'off' | 'indeterminate'; disabled?: boolean } => {
    // No nodes selected, or some non-terminal nodes selected:
    if (selectedNodeIndicators.length === 0 || !(selectedNodeObjects.every(isTerminal)))
      return { disabled: true, toggleState: 'off' };

    // At this point we know that there are selected nodes and that they are all terminal
    const selectedTerminalNodes = selectedNodeObjects as UnpositionedTerminalNode[];
    // Only triangle nodes selected:
    if (selectedTerminalNodes.every(node => node.triangle)) return { toggleState: 'on' };
    // Some triangle nodes and some non-triangle nodes selected:
    if (selectedTerminalNodes.some(node => node.triangle)) return { toggleState: 'indeterminate' };
    // Only non-triangle nodes selected:
    return { toggleState: 'off' };
  };

  const items: ToolboxItem[] = [
    { title: 'Undo', icon: IconArrowBackUp, action: undo, disabled: !canUndo(state), hotkey: 'Ctrl-Z',
      description: 'Undo the last action.' },
    { title: 'Redo', icon: IconArrowForwardUp, action: redo, disabled: !canRedo(state), hotkey: 'Ctrl-Y',
      description: 'Redo the last undone action.' },
    { title: 'Add', icon: IconPlus, action: addNode, disabled: nothingSelected, hotkey: 'Up',
      description: 'Add a new parent node for the selected text or nodes.' },
    { title: 'Delete', icon: IconTrash, action: deleteNode, disabled: noNodesSelected, hotkey: 'Backspace',
      description: 'Delete the selected nodes.' },
    { title: 'Edit', icon: IconPencil, action: startEditing, disabled: noNodesSelected, hotkey: 'Enter',
      toggleState: state.editedNodeIndicator ? 'on' : 'off', description: 'Edit the selected node.' },
    { title: 'Triangle', icon: IconTriangle, ...getTriangleButtonState(),
      action: (_, focusEvent) =>
        // Terrible hack to figure out if the user was in the middle of editing a node when they clicked the button
        toggleTriangle(focusEvent?.relatedTarget?.className === 'LabelNodeEditorInput'),
      description: 'Toggle triangle connectors for the selected terminal nodes.'
    },
    { title: 'Adopt', icon: IconAdoptNode, action: toggleAdoptMode, disabled: noNodesSelected,
      toggleState: state.selectionAction === 'adopt' ? 'on' : 'off',
      description: 'Adopt one or more nodes as children of the selected node.' },
    { title: 'Disown', icon: IconDisownNode, action: toggleDisownMode, disabled: noNodesSelected,
      toggleState: state.selectionAction === 'disown' ? 'on' : 'off',
      description: 'Disown one or more children of the selected node.' },
    { title: 'Reset position', icon: IconResetNodePosition, action: resetNodePositions, disabled: noNodesSelected,
      description: 'Relocate the selected nodes to their original positions.' },
  ];

  return <div className="Toolbox--container">
    <Paper
      shadow="sm"
      p="xs"
      className="Toolbox--body"
    >
      <div className="Toolbox--title">Tools</div>
      <SimpleGrid cols={2} spacing={2} verticalSpacing={2}>
        {items.map(item =>
          <div
            key={item.title}
            onMouseEnter={() => setHoveredItem(item)}
            onMouseLeave={() => setHoveredItem(undefined)}
          >
            <ActionIcon
              size="lg"
              variant={item.toggleState === 'on' ? 'gradient' : item.toggleState === 'indeterminate' ? 'light' : 'subtle'}
              disabled={item.disabled}
              color={theme.primaryColor}
              sx={{ ':disabled': { backgroundColor: theme.white, borderColor: theme.white } }}
              onFocus={e => { lastFocusEvent.current = e; }}
              onClick={clickEvent => item.action(clickEvent, lastFocusEvent.current)}
            >
              {item.icon
                ? <item.icon stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }}/>
                : item.title.slice(0, 2)}
            </ActionIcon>
          </div>
        )}
      </SimpleGrid>
    </Paper>
    {hoveredItem && <Paper
      shadow="sm"
      p="sm"
      className="Toolbox--tool-info"
    >
      <div className="Toolbox--tool-title">
        {hoveredItem.title}
        {hoveredItem.hotkey && ` (${substituteOsAwareHotkey(hoveredItem.hotkey, os)})`}
      </div>
      <div>{hoveredItem.description}</div>
    </Paper>}
  </div>;
};

export default Toolbox;
