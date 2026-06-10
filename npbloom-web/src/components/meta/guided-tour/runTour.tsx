import { SVG_X, SVG_Y } from '../../../uiDimensions';
import { AddBranchingNodeByTarget, AddTerminalNodeByTarget, AddTree, applyTourStepsUpTo, CoordsInPlot, guidedTourSteps, LoadState, SetEditedNodeLabel, SetSentence, StringSlice, UiAction } from 'npbloom-core';
import { clickElement, clickElementCenter, removeGhostCursor, typeIntoInput, wait, waitForElement } from './tourAnimationUtils';

// HACK: The tour depends on specific entity IDs, but entities created during the tour will have randomly generated IDs.
// To ensure the tour works correctly, when creating new nodes, we will store the actual generated IDs here,
// and proxy to them from the fake IDs used in the tour steps.
const fakeIdToRealIdMap: Record<string, string> = {};

/**
 * Gets the ID of the most recently created node by querying the DOM.
 * This relies on the assumption that new nodes are added at the end of the list of node elements in the DOM.
 */
const getLastCreatedNodeId = (): string => {
  const nodes = document.querySelectorAll('g.TreeView--node');
  const lastNode = nodes[nodes.length - 1];
  if (lastNode) {
    const nodeId = lastNode.getAttribute('data-node-id');
    if (nodeId) {
      return nodeId;
    }
  }
  throw new Error('Failed to get last created node ID');
}

/**
 * Registers a fake ID used in the tour steps with the real ID of the newly created node.
 * This allows subsequent actions that refer to the fake ID to interact with the correct node in the DOM.
 */
const registerFakeId = async (fakeId: string, signal: AbortSignal, realId?: string) => {
  // Wait a bit to ensure the DOM has updated
  await wait(50, signal);
  // Get the real ID of the newly created node and store it in the map
  fakeIdToRealIdMap[fakeId] = realId ?? getLastCreatedNodeId();
};

/**
 * Clears the fake ID to real ID mapping. Should be called at the start of each step to avoid stale mappings.
 */
const clearIdMap = () => {
  for (const key in fakeIdToRealIdMap) {
    delete fakeIdToRealIdMap[key];
  }
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified child IDs.
 */
const clickNodeCreationTriggerByChildIds = async (childIds: string[], fakeNodeId: string, signal: AbortSignal) => {
  const realChildIds = childIds.map(id => fakeIdToRealIdMap[id] || id);
  const triggerElement = document.querySelector(`.NodeCreationTriggerClickZone[data-target-children="${realChildIds.join(',')}"]`) as Element | undefined;
  if (triggerElement) {
    await clickElementCenter(triggerElement, true, signal);
    await registerFakeId(fakeNodeId, signal);
  } else {
    console.warn(`No node creation trigger found for child IDs: ${realChildIds.join(',')}`);
  }
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified slice of the sentence.
 */
const clickNodeCreationTriggerBySlice = async (slice: StringSlice, fakeNodeId: string, signal: AbortSignal) => {
  const triggerElement = document.querySelector(`.NodeCreationTriggerClickZone[data-target-slice="${slice.start},${slice.endExclusive}"]`) as Element | undefined;
  if (triggerElement) {
    await clickElementCenter(triggerElement, true, signal);
    await registerFakeId(fakeNodeId, signal);
  } else {
    console.warn(`No node creation trigger found for slice: ${slice.start}-${slice.endExclusive}`);
  }
};

const pressEnter = (inputElement: HTMLInputElement) => {
  const event = new KeyboardEvent('keydown', {
    key: 'Enter',
    code: 'Enter',
    keyCode: 13,
    which: 13,
    bubbles: true,
  });
  inputElement.dispatchEvent(event);
};

/**
 * Simulates the specified user action by performing the corresponding interactions with the ghost cursor.
 */
const simulateAction = async (action: UiAction, signal: AbortSignal) => {
  if (action instanceof AddTree) {
    const x = action.coordsInPlot.plotX + SVG_X;
    const y = action.coordsInPlot.plotY + SVG_Y;
    await clickElement(document.querySelector('.PlotView--svg') as Element, x, y, true, signal);
  } else if (action instanceof SetSentence) {
    const sentenceInput = await waitForElement<HTMLInputElement>('.SentenceView--input', signal, 1000);
    await typeIntoInput(sentenceInput, action.newSentence, signal);
  } else if (action instanceof AddTerminalNodeByTarget) {
    await clickNodeCreationTriggerBySlice(action.targetSlice, action.newNodeId, signal);
  } else if (action instanceof AddBranchingNodeByTarget) {
    await clickNodeCreationTriggerByChildIds(action.targetChildIds, action.newNodeId, signal);
  } else if (action instanceof SetEditedNodeLabel) {
    const inputElement = await waitForElement<HTMLInputElement>('.LabelNodeEditorInput', signal, 1000);
    await typeIntoInput(inputElement, action.newLabel, signal);
    pressEnter(inputElement);
  } else {
    console.warn('No simulation defined for action type:', action.constructor.name);
  }
}

/**
 * Duration to wait after each step's actions are completed before repeating the step.
 */
const REPEAT_DELAY_MS = 2000;

let isTourRunning = false;

let abortCurrentCycle: (() => void) | null = null;

const isAbortError = (e: unknown): boolean =>
  e instanceof DOMException && e.name === 'AbortError';

const treePositionByViewport = (viewportWidth: number, viewportHeight: number) => new CoordsInPlot(
  Math.round(viewportWidth / 2.0 - 50.0 - SVG_X),
  // Position the tree below the center of the viewport, to avoid being obscured by the guided tour text which is centered in the viewport.
  // At the same time, ensure the tree is not too close to the bottom edge of the viewport, to avoid being cut off.
  Math.min(Math.round(viewportHeight / 2.0 + 200.0 - SVG_Y), viewportHeight - 100),
);

export const getInitialTreePosition = () => treePositionByViewport(window.innerWidth, window.innerHeight);

/**
 * The main entry point for running the guided tour. It takes care of orchestrating the execution of tour steps,
 * including handling user-initiated step advancement (which will abort the current cycle and advance to the next step)
 * and DOM disruptions (which will abort the current cycle and restart the same step).
 * @param dispatch The Redux dispatch function to dispatch actions that set up the state for each step.
 * @param onStepStart A callback that is called at the start of each step, with the step index as an argument.
 * Can be used to trigger the fade-out animation on the guided tour text.
 * @param onStepReady A callback that is called when a step's actions have completed, with the step index as an argument (or -1 if the tour is complete).
 * Can be used to trigger the fade-in animation on the guided tour text.
 * @returns An object with an `advance` method that can be called to programmatically advance to the next step.
 */
const runTour = (
  dispatch: React.Dispatch<UiAction>,
  onStepStart: (stepIndex: number) => void,
  onStepReady: (stepIndex: number) => void,
): { advance: () => void } => {
  const advance = () => abortCurrentCycle?.();

  if (isTourRunning) {
    console.warn('Tour is already running, ignoring additional runTour call');
    return { advance };
  }

  const run = async () => {
    isTourRunning = true;
    const steps = guidedTourSteps(getInitialTreePosition());

    // Loop through the steps, and for each step, perform its actions in a loop.
    for (let i = 0; i < steps.length; i++) {
      let stepAdvanced = false;

      while (!stepAdvanced) {
        const controller = new AbortController();
        abortCurrentCycle = () => { stepAdvanced = true; controller.abort(); };

        onStepStart(i);
        clearIdMap();
        // Set up the state for this step by applying all the tour steps up to this one.
        // This ensures that the state is correct even if the user advances through the steps quickly.
        dispatch(new LoadState(applyTourStepsUpTo(steps[i].id, getInitialTreePosition())));

        try {
          for (const action of steps[i].actions) {
            await wait(400, controller.signal);
            // The heart of the tour:
            // Translate each action into user interactions with the ghost cursor, and wait for them to complete before moving on to the next action.
            await simulateAction(action, controller.signal);
          }
          onStepReady(i);
          await wait(REPEAT_DELAY_MS, controller.signal);
          // No abort - loop repeats from the top
        } catch (e) {
          if (isAbortError(e)) {
            if (stepAdvanced) break;  // Next clicked -> move to next step
            // else: DOM disruption -> while loop continues, cycle restarts
          } else {
            throw e;
          }
        }
      }
    }

    removeGhostCursor();
    onStepReady(-1);
    isTourRunning = false;
  };

  run();
  return { advance };
};

export default runTour;
