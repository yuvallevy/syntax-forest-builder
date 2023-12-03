import {
  AddNodeBySelection, DeleteSelectedEntities, EntitySelectionAction, generateNodeId, NodeSelectionInPlot,
  NoSelectionInPlot, Redo, ResetSelectedNodePositions, SetSelectionAction, SliceSelectionInPlot, StartEditing,
  TreeSelectionInPlot, ToggleTriangle, Undo, UnpositionedTerminalNode
} from 'npbloom-core';
import { useTranslation } from 'react-i18next';
import { ActionIcon, Paper, SimpleGrid, useMantineTheme } from '@mantine/core';
import {
  IconArrowBackUp, IconArrowForwardUp, IconPencil, IconPlus, IconTrash, IconTriangle, TablerIconsProps
} from '@tabler/icons-react';
import { useRef, useState } from 'react';
import './Toolbox.scss';
import substituteOsAwareHotkey from './substituteOsAwareHotkey';
import { useOs } from '@mantine/hooks';
import { IconAdoptNode, IconDisownNode, IconResetNodePosition, IconToggleTreeSelectionMode } from './icons';
import useUiState from '../useUiState';

type ToolboxItem = {
  key: string;
  icon?: (props: TablerIconsProps) => JSX.Element;
  action: (event: React.UIEvent, focusEvent?: React.FocusEvent) => void;
  disabled?: boolean;
  toggleState?: 'on' | 'off' | 'indeterminate';
  hotkey?: string;
  hotkeyHold?: boolean;
  descriptionKey?: string;
};

const Toolbox: React.FC = () => {
  const { t } = useTranslation();

  const { state, dispatch } = useUiState();

  const noTreesInPlot = state.contentState.current.plots[state.activePlotIndex].treeCount === 0;
  const noNodesOrSliceSelected = state.selection === NoSelectionInPlot.getInstance() ||
    state.selection instanceof TreeSelectionInPlot;
  const sentenceIsEmpty = state.selection instanceof SliceSelectionInPlot &&
    state.contentState.current.plots[state.activePlotIndex]
      .tree((state.selection as SliceSelectionInPlot).treeId).sentence === '';
  const noNodesSelected = !(state.selection instanceof NodeSelectionInPlot);
  const noTreesSelected = !(state.selection instanceof TreeSelectionInPlot);
  const selectedNodeIndicators = state.selection instanceof NodeSelectionInPlot
    ? state.selection.nodeIndicatorsAsArray : [];
  const selectedNodeObjects = selectedNodeIndicators.map(({ treeId, nodeId }) =>
    state.contentState.current.plots[state.activePlotIndex].tree(treeId).node(nodeId));

  const startEditing = () => dispatch(new StartEditing());
  const addNode = () => dispatch(new AddNodeBySelection(generateNodeId()));
  const deleteEntities = () => dispatch(new DeleteSelectedEntities());
  const resetNodePositions = () => dispatch(new ResetSelectedNodePositions());
  const toggleTriangle = (wasEditing: boolean) => {
    dispatch(new ToggleTriangle());
    wasEditing && setTimeout(startEditing, 50);  // Hack to restore focus to edited node when clicking the triangle button.
  };
  const toggleAdoptMode = () => dispatch(new SetSelectionAction(
    state.selectionAction === EntitySelectionAction.Adopt ? EntitySelectionAction.SelectNode : EntitySelectionAction.Adopt));
  const toggleDisownMode = () => dispatch(new SetSelectionAction(
    state.selectionAction === EntitySelectionAction.Disown ? EntitySelectionAction.SelectNode : EntitySelectionAction.Disown));
  const toggleTreeSelectMode = () => dispatch(new SetSelectionAction(
    state.selectionAction === EntitySelectionAction.SelectTree ? EntitySelectionAction.SelectNode : EntitySelectionAction.SelectTree));
  const undo = () => dispatch(new Undo());
  const redo = () => dispatch(new Redo());

  const os = useOs();

  const [hoveredItem, setHoveredItem] = useState<ToolboxItem>();

  const lastFocusEvent = useRef<React.FocusEvent>();

  const theme = useMantineTheme();

  const getTriangleButtonState = (): { toggleState: 'on' | 'off' | 'indeterminate'; disabled?: boolean } => {
    // No nodes selected, or some non-terminal nodes selected:
    if (selectedNodeIndicators.length === 0 ||
      !(selectedNodeObjects.every(node => node instanceof UnpositionedTerminalNode)))
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
    { key: 'undo', icon: IconArrowBackUp, action: undo, disabled: !state.contentState.canUndo, hotkey: 'Ctrl-Z' },
    { key: 'redo', icon: IconArrowForwardUp, action: redo, disabled: !state.contentState.canRedo, hotkey: 'Ctrl-Y' },
    { key: 'add', icon: IconPlus, action: addNode, disabled: noNodesOrSliceSelected || sentenceIsEmpty, hotkey: 'Up' },
    { key: 'delete', icon: IconTrash, action: deleteEntities, disabled: noNodesSelected && noTreesSelected,
      hotkey: 'Backspace',
      descriptionKey: state.selection instanceof TreeSelectionInPlot ? 'deleteTrees' : 'deleteNodes' },
    { key: 'edit', icon: IconPencil, action: startEditing, disabled: noNodesSelected, hotkey: 'Enter',
      toggleState: state.editedNodeIndicator ? 'on' : 'off' },
    { key: 'triangle', icon: IconTriangle, ...getTriangleButtonState(),
      action: (_, focusEvent) =>
        // Terrible hack to figure out if the user was in the middle of editing a node when they clicked the button
        toggleTriangle(focusEvent?.relatedTarget?.className === 'LabelNodeEditorInput')
    },
    { key: 'adopt', icon: IconAdoptNode, action: toggleAdoptMode, disabled: noNodesSelected,
      toggleState: state.selectionAction === EntitySelectionAction.Adopt ? 'on' : 'off' },
    { key: 'disown', icon: IconDisownNode, action: toggleDisownMode, disabled: noNodesSelected,
      toggleState: state.selectionAction === EntitySelectionAction.Disown ? 'on' : 'off' },
    { key: 'resetPosition', icon: IconResetNodePosition, action: resetNodePositions, disabled: noNodesSelected },
    { key: 'selectTrees', icon: IconToggleTreeSelectionMode, action: toggleTreeSelectMode, disabled: noTreesInPlot,
      toggleState: state.selectionAction === EntitySelectionAction.SelectTree ? 'on' : 'off', hotkey: 'Alt',
      hotkeyHold: true },
  ];

  return <div className="Toolbox--container">
    <Paper
      shadow="sm"
      p="xs"
      className="Toolbox--body"
    >
      <div className="Toolbox--title">{t('toolbox.title')}</div>
      <SimpleGrid cols={2} spacing={2} verticalSpacing={2}>
        {items.map(item =>
          <div
            key={item.key}
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
                : item.key.slice(0, 2)}
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
        {t(`toolbox.items.${hoveredItem.key}.title`)}
        {hoveredItem.hotkey && (
          hoveredItem.hotkeyHold
            ? ` (${t('toolbox.tooltips.hotkeyHold', { hotkey: substituteOsAwareHotkey(hoveredItem.hotkey, os) })})`
            : <> (<bdo dir="ltr">{substituteOsAwareHotkey(hoveredItem.hotkey, os)}</bdo>)</>
        )}
      </div>
      <div>{hoveredItem.descriptionKey
        ? t(`toolbox.items.${hoveredItem.key}.descriptions.${hoveredItem.descriptionKey}`)
        : t(`toolbox.items.${hoveredItem.key}.description`)}</div>
    </Paper>}
  </div>;
};

export default Toolbox;
