import { SVG_X, SVG_Y } from '../../../uiDimensions';
import { AddBranchingNodeByTarget, AddTerminalNodeByTarget, AddTree, applyTourStepsUpTo, guidedTourSteps, LoadState, NoSelectionInPlot, SetEditedNodeLabel, SetSelection, SetSentence, StringSlice, UiAction } from 'npbloom-core';
import { clickElement, clickElementCenter, removeGhostCursor, wait } from './tourAnimationUtils';

// HACK: The tour depends on specific entity IDs, but entities created during the tour will have randomly generated IDs.
// To ensure the tour works correctly, when creating new nodes, we will store the actual generated IDs here,
// and proxy to them from the fake IDs used in the tour steps.
const fakeIdToRealIdMap: Record<string, string> = {};

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

const registerFakeId = async (fakeId: string, realId?: string) => {
  // Wait a bit to ensure the DOM has updated
  await wait(50);
  // Get the real ID of the newly created node and store it in the map
  fakeIdToRealIdMap[fakeId] = realId ?? getLastCreatedNodeId();
  console.log(`Registered fake ID '${fakeId}' as real ID '${fakeIdToRealIdMap[fakeId]}'`);
};

const clearIdMap = () => {
  for (const key in fakeIdToRealIdMap) {
    delete fakeIdToRealIdMap[key];
  }
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified child IDs.
 */
const clickNodeCreationTriggerByChildIds = async (childIds: string[], fakeNodeId: string) => {
  const realChildIds = childIds.map(id => fakeIdToRealIdMap[id] || id);
  const triggerElement = document.querySelector(`.NodeCreationTriggerClickZone[data-target-children="${realChildIds.join(',')}"]`) as Element | undefined;
  if (triggerElement) {
    await clickElementCenter(triggerElement, true);
    await registerFakeId(fakeNodeId);
  } else {
    console.warn(`No node creation trigger found for child IDs: ${realChildIds.join(',')}`);
  }
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified slice of the sentence.
 */
const clickNodeCreationTriggerBySlice = async (slice: StringSlice, fakeNodeId: string) => {
  const triggerElement = document.querySelector(`.NodeCreationTriggerClickZone[data-target-slice="${slice.start},${slice.endExclusive}"]`) as Element | undefined;
  if (triggerElement) {
    await clickElementCenter(triggerElement, true);
    await registerFakeId(fakeNodeId);
  } else {
    console.warn(`No node creation trigger found for slice: ${slice.start}-${slice.endExclusive}`);
  }
};

/**
 * Waits for the specified input element to receive focus, checking periodically and forcing focus after a certain number of attempts.
 */
const waitForFocus = async (
  inputElement: HTMLInputElement,
  attemptsBeforeForce: number = 3,
  intervalBetweenAttemptsMs: number = 100,
): Promise<void> => new Promise((resolve, reject) => {
  let attempts = 0;

  const checkFocus = () => {
    if (document.activeElement === inputElement) {
      resolve();
    } else {
      attempts++;
      if (attempts >= attemptsBeforeForce) {
        // Force focus if max attempts reached
        inputElement.focus();
        setTimeout(() => {
          if (document.activeElement === inputElement) {
            resolve();
          } else {
            reject(new Error('Failed to focus input element after multiple attempts'));
          }
        }, intervalBetweenAttemptsMs);
      } else {
        setTimeout(checkFocus, intervalBetweenAttemptsMs);
      }
    }
  };

  checkFocus();
});

/**
 * Simulates typing the given text into the specified input element, letter by letter.
 * Ensures the input element is focused before typing, and includes a small delay between keystrokes to mimic natural typing.
 */
const typeIntoInput = async (
  inputElement: HTMLInputElement,
  text: string,
  keystrokeDelayMs: number = 60,
  keystrokeDelayVarianceMs: number = 40,
  keystrokeDelayBeforeChars: { [char: string]: number } = { ' ': 200, '.': 300, ',': 300 },
) => {
  await waitForFocus(inputElement);

  for (const char of text) {
    const delayVariance = Math.floor(Math.random() * keystrokeDelayVarianceMs * 2) - keystrokeDelayVarianceMs; // Random variance between -variance and +variance
    const delayBefore = keystrokeDelayBeforeChars[char] || 0;
    if (delayBefore > 0) {
      await new Promise(resolve => setTimeout(resolve, delayBefore + delayVariance));
    }
    inputElement.value += char;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await new Promise(resolve => setTimeout(resolve, keystrokeDelayMs + delayVariance));
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

const simulateAction = async (action: UiAction) => {
  if (action instanceof AddTree) {
    const x = action.coordsInPlot.plotX + SVG_X;
    const y = action.coordsInPlot.plotY + SVG_Y;
    await clickElement(document.querySelector('.PlotView--svg') as Element, x, y, true);
  } else if (action instanceof SetSentence) {
    await typeIntoInput(document.querySelector('.SentenceView--input') as HTMLInputElement, action.newSentence);
  } else if (action instanceof AddTerminalNodeByTarget) {
    await clickNodeCreationTriggerBySlice(action.targetSlice, action.newNodeId);
  } else if (action instanceof AddBranchingNodeByTarget) {
    await clickNodeCreationTriggerByChildIds(action.targetChildIds, action.newNodeId);
  } else if (action instanceof SetEditedNodeLabel) {
    const inputElement = document.querySelector('.LabelNodeEditorInput') as HTMLInputElement;
    await typeIntoInput(inputElement, action.newLabel);
    pressEnter(inputElement);
  } else {
    console.warn('No simulation defined for action type:', action.constructor.name);
  }
}

let isTourRunning = false;
let resolveAdvance: (() => void) | null = null;

const runTour = (
  dispatch: React.Dispatch<UiAction>,
  onStepStart: (stepIndex: number) => void,
  onStepReady: (stepIndex: number) => void,
): { advance: () => void } => {
  const advance = () => resolveAdvance?.();

  if (isTourRunning) {
    console.warn('Tour is already running, ignoring additional runTour call');
    return { advance };
  }

  const run = async () => {
    isTourRunning = true;
    resolveAdvance = null;
    const steps = guidedTourSteps.get();

    for (let i = 0; i < steps.length; i++) {
      onStepStart(i);
      clearIdMap();
      dispatch(new LoadState(applyTourStepsUpTo(steps[i].id)));

      for (const action of steps[i].actions) {
        await wait(400);
        await simulateAction(action);
      }

      onStepReady(i);
      await new Promise<void>(resolve => { resolveAdvance = resolve; });
    }

    await wait(1000);
    removeGhostCursor();
    onStepReady(-1);
    isTourRunning = false;
  };

  run();
  return { advance };
};

export default runTour;
