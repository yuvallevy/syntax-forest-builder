import cursorImage from './demo-cursor.svg';

const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

let activeTween: { cancel: () => void } | null = null;

const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

const getGhostCursorElement = (): HTMLImageElement => {
  let el = document.getElementById('demo-ghost-cursor') as HTMLImageElement | null;
  if (!el) {
    el = document.createElement('img') as HTMLImageElement;
    el.id = 'demo-ghost-cursor';
    el.src = cursorImage;
    el.style.position = 'fixed';
    el.style.left = '0';
    el.style.top = '0';
    const windowCenterX = window.innerWidth / 2, windowCenterY = window.innerHeight / 2;
    el.style.transform = 'translate(' + windowCenterX + 'px, ' + windowCenterY + 'px)';
    el.style.pointerEvents = 'none';
    document.body.appendChild(el);
  }
  return el;
};

const setGhostCursorPosition = (x: number, y: number) =>
  getGhostCursorElement().style.transform = `translate(${x}px, ${y}px)`;

const removeGhostCursor = () => {
  const el = document.getElementById('demo-ghost-cursor');
  if (el) {
    el.remove();
  }
};

const ghostCursorAnimationDuration = (dx: number, dy: number): number => {
  const distance = Math.sqrt(dx * dx + dy * dy);
  return clamp(distance * 0.6, 350, 1200);  // duration proportional to distance, but between 350ms and 1200ms
};

const ghostCursorAnimationDurationByTarget = (targetX: number, targetY: number): number => {
  const ghostEl = getGhostCursorElement();
  const start = ghostEl.getBoundingClientRect();
  const dx = targetX - start.x, dy = targetY - start.y;
  return ghostCursorAnimationDuration(dx, dy);
};

const moveGhostCursorTo = (x: number, y: number): Promise<void> => {
  if (activeTween) activeTween.cancel();   // interrupt any in-flight move

  const ghostEl = getGhostCursorElement();
  const start = ghostEl.getBoundingClientRect();
  const dx = x - start.x, dy = y - start.y;
  const ms = ghostCursorAnimationDuration(dx, dy);
  const t0 = performance.now();
  let raf: number, canceled = false;
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);  // cubic ease-out for a natural deceleration

  return new Promise(resolve => {
    activeTween = { cancel: () => { canceled = true; cancelAnimationFrame(raf); resolve(); } };
    const step = (now: number) => {
      if (canceled) return;
      const t = Math.min((now - t0) / ms, 1);
      const cx = start.x + dx * ease(t), cy = start.y + dy * ease(t);
      ghostEl.style.transform = `translate(${cx}px, ${cy}px)`;
      setGhostCursorPosition(cx, cy);
      if (t < 1) raf = requestAnimationFrame(step);
      else { activeTween = null; resolve(); }
    };
    raf = requestAnimationFrame(step);
  });
}

/**
 * Simulates a mouse event (like 'click') at the specified coordinates on the given element.
 */
const fireMouseEvent = (element: Element, eventName: string, x: number, y: number) => {
  const event = new MouseEvent(eventName, {
    view: window,
    bubbles: true,
    cancelable: true,
    clientX: x,
    clientY: y
  });
  element.dispatchEvent(event);
};

/**
 * Simulates a sequence of mouse events (like 'mousedown' followed by 'mouseup') at the specified coordinates on the given element,
 * with an optional delay between events to mimic natural user interaction.
 */
const fireMouseEvents = async (element: Element, eventNames: string[], x: number, y: number, delayBetweenEventsMs: number = 100) => {
  for (let i = 0; i < eventNames.length; i++) {
    const eventName = eventNames[i];
    fireMouseEvent(element, eventName, x, y);
    // If there is a next event, wait a bit before firing it to simulate natural user interaction
    if (i < eventNames.length - 1) {
      await new Promise(resolve => setTimeout(resolve, delayBetweenEventsMs));
    }
  }
};

/**
 * Simulates a click at the specified coordinates on the given element,
 * optionally using 'mousedown' and 'mouseup' events instead of a single 'click' event.
 */
const clickElement = async (element: Element, x: number, y: number, useMouseDownAndUp: boolean = false) => {
  await moveGhostCursorTo(x, y);
  if (useMouseDownAndUp) {
    await fireMouseEvents(element, ['mousedown', 'mouseup'], x, y);
  } else {
    fireMouseEvent(element, 'click', x, y);
  }
  // Move cursor away a bit after the click for better visibility of the click effect
  // This is not `await`ed because we don't want to delay the next action
  moveGhostCursorTo(x + 5, y + 10);
};

/**
 * Simulates a click on the center of the given element.
 */
const clickElementCenter = (element: Element, simulateHover: boolean = false) => {
  const r = element.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (simulateHover) {
    // Add "hover" class to a little before the click to simulate a hover state, which can be useful for demo purposes
    const animationDuration = ghostCursorAnimationDurationByTarget(x, y);
    setTimeout(() => element.classList.add('hover'), animationDuration * 0.5);
  }
  clickElement(element, x, y);
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified child labels.
 * If there are multiple triggers with the same child labels, the nth one (0-indexed) will be clicked.
 */
const clickNodeCreationTriggerByChildLabels = (childLabels: string[], nth: number = 0) => {
  const triggerElement = document.querySelectorAll(`.NodeCreationTriggerClickZone[data-target-children="${childLabels.join(',')}"]`)[nth] as Element | undefined;
  if (triggerElement) {
    clickElementCenter(triggerElement, true);
  } else {
    console.warn(`No node creation trigger found for child labels: ${childLabels.join(',')}`);
  }
};

/**
 * Simulates a click on the node creation trigger that corresponds to the specified slice of the sentence.
 */
const clickNodeCreationTriggerByWord = async (word: string) => {
  const triggerElement = document.querySelector(`.NodeCreationTriggerClickZone[data-target-slice="${word}"]`) as Element | undefined;
  if (triggerElement) {
    clickElementCenter(triggerElement, true);
  } else {
    console.warn(`No node creation trigger found for word: ${word}`);
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

const pressEscape = () => {
  const event = new KeyboardEvent('keydown', {
    key: 'Escape',
    code: 'Escape',
    keyCode: 27,
    which: 27,
    bubbles: true,
  });
  document.dispatchEvent(event);
};

/**
 * Creates a new tree by simulating a click at the specified coordinates to start the tree,
 * then typing the given sentence into the input that appears.
 */
const createNewTree = async (
  x: number,
  y: number,
  sentence: string,
) => {
  const plotElement = document.querySelector('.PlotView--svg') as Element;
  await clickElement(plotElement, x, y, true);

  const inputElement = document.querySelector('.SentenceView--input') as HTMLInputElement;
  await typeIntoInput(inputElement, sentence + (sentence.endsWith('.') ? '' : '.'));
};

const addNodeByChildLabels = async (childLabels: string[], partOfSpeech: string, nth: number = 0) => {
  await wait(200);
  await clickNodeCreationTriggerByChildLabels(childLabels, nth);
  await wait(500);
  const inputElement = document.querySelector('.LabelNodeEditorInput') as HTMLInputElement;
  await typeIntoInput(inputElement, partOfSpeech);
  await pressEnter(inputElement);
};

const addNodeByWord = async (word: string, partOfSpeech: string) => {
  await wait(200);
  await clickNodeCreationTriggerByWord(word);
  await wait(500);
  const inputElement = document.querySelector('.LabelNodeEditorInput') as HTMLInputElement;
  await typeIntoInput(inputElement, partOfSpeech);
  pressEnter(inputElement);
};

const addNodesForWords = async (words: string[], partsOfSpeech: string[]) => {
  for (let i = 0; i < words.length; i++) {
    await addNodeByWord(words[i], partsOfSpeech[i]);
  }
};

let isDemoRunning = false;

const runDemo = async (nextStep: () => Promise<void>) => {
  if (isDemoRunning) {
    console.warn('Demo is already running, ignoring additional runDemo call');
    return;
  }
  isDemoRunning = true;

  const sentence = 'I drew this tree'; // Hardcoded sentence for the demo
  await createNewTree(window.innerWidth / 2 - 50, window.innerHeight / 2 + 170, sentence);

  await nextStep();
  const words = sentence.split(' ').filter(w => w.length > 0);
  const partsOfSpeech = ['N', 'V', 'Det', 'N']; // Generated sentences always follow this pattern
  await addNodesForWords(words, partsOfSpeech);

  await nextStep();
  await wait(800);
  await addNodeByChildLabels(['N'], 'NP');
  await wait(500);

  await nextStep();
  await wait(800);
  await addNodeByChildLabels(['Det', 'N'], 'NP');
  await wait(800);

  await nextStep();
  await wait(500);
  await addNodeByChildLabels(['V', 'NP'], 'VP');
  await wait(200);
  await addNodeByChildLabels(['NP', 'VP'], 'S');
  await wait(800);

  await nextStep();
  await wait(800);
  pressEscape();
  await wait(1000);
  removeGhostCursor();

  await nextStep();
};

export default runDemo;
