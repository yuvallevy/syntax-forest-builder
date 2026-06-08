import cursorImage from './demo-cursor.svg';

/**
 * How signals are used here:
 *
 * Each tour animation cycle (one pass through a step's actions) is owned by an AbortController.
 * Its signal is passed to every async helper here.
 *
 * Two things can abort a cycle:
 * 1. The user clicks "Next" - runTour sets stepAdvanced=true and calls controller.abort().
 * 2. DOM disruption (e.g. a user click closes a focused input, removing it from the DOM) -
 *    waitForElement times out and throws AbortError without setting stepAdvanced.
 *
 * runTour's catch block reads stepAdvanced to distinguish these:
 *   - stepAdvanced=true  -> break out of the step loop (advance to next step)
 *   - stepAdvanced=false -> continue the while loop (restart the same step from scratch)
 *
 * Convention in this file: every async function that can block accepts an optional signal and
 * either rejects with abortError() when it fires, or checks signal.aborted between iterations.
 * Synchronous helpers (fireMouseEvent, pressEnter) do not need a signal.
 */
const abortError = () => new DOMException('Aborted', 'AbortError');

/**
 * Returns a promise that resolves after the specified time, or rejects with AbortError if the signal is aborted before the timeout.
 * The returned timeout ID is automatically cleared if the signal is aborted to prevent memory leaks.
 */
export const wait = (ms: number, signal?: AbortSignal): Promise<void> => {
  if (signal?.aborted) return Promise.reject(abortError());
  return new Promise((resolve, reject) => {
    const id = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => { clearTimeout(id); reject(abortError()); }, { once: true });
  });
};

/**
 * Tracks the currently active ghost cursor animation, if any.
 */
let activeTween: { cancel: () => void } | null = null;

/**
 * Clamps a number between a minimum and maximum value.
 */
const clamp = (num: number, min: number, max: number) => Math.min(Math.max(num, min), max);

/**
 * Returns the ghost cursor element, creating it if it doesn't exist.
 */
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

/**
 * Sets the position of the ghost cursor to the specified coordinates.
 * This immediately moves the cursor without animation, and is used under the hood by moveGhostCursorTo
 * to update the cursor's position on each animation frame.
 */
const setGhostCursorPosition = (x: number, y: number) =>
  getGhostCursorElement().style.transform = `translate(${x}px, ${y}px)`;

/**
 * Removes the ghost cursor element from the DOM if it exists.
 */
export const removeGhostCursor = () => {
  const el = document.getElementById('demo-ghost-cursor');
  if (el) {
    el.remove();
  }
};

/**
 * Calculates the duration of the ghost cursor animation based on the distance it needs to travel.
 * For a more convincing effect, the duration is proportional to the distance and clamped between a minimum and maximum value.
 */
const ghostCursorAnimationDuration = (dx: number, dy: number): number => {
  const distance = Math.sqrt(dx * dx + dy * dy);
  return clamp(distance * 0.6, 350, 1200);  // duration proportional to distance, but between 350ms and 1200ms
};

/**
 * Calculates the duration of the ghost cursor animation based on the distance to the target coordinates from the ghost cursor's current position.
 */
const ghostCursorAnimationDurationByTarget = (targetX: number, targetY: number): number => {
  const ghostEl = getGhostCursorElement();
  const start = ghostEl.getBoundingClientRect();
  const dx = targetX - start.x, dy = targetY - start.y;
  return ghostCursorAnimationDuration(dx, dy);
};

/**
 * Animates the ghost cursor moving smoothly to the specified coordinates.
 * If there is an existing animation in progress, it will be canceled and the cursor will immediately jump to the new target.
 * Returns a promise that resolves when the animation completes, or rejects with AbortError if the signal is aborted during the animation.
 */
export const moveGhostCursorTo = (x: number, y: number, signal?: AbortSignal): Promise<void> => {
  if (activeTween) activeTween.cancel();   // interrupt any in-flight move
  if (signal?.aborted) return Promise.reject(abortError());

  const ghostEl = getGhostCursorElement();
  const start = ghostEl.getBoundingClientRect();
  const dx = x - start.x, dy = y - start.y;
  const ms = ghostCursorAnimationDuration(dx, dy);
  const t0 = performance.now();
  let raf: number, canceled = false;
  const ease = (t: number) => 1 - Math.pow(1 - t, 3);  // cubic ease-out for a natural deceleration

  return new Promise((resolve, reject) => {
    activeTween = { cancel: () => { canceled = true; cancelAnimationFrame(raf); resolve(); } };

    // On abort, cancel the animation and reject the promise with an abort error
    signal?.addEventListener('abort', () => {
      canceled = true;
      cancelAnimationFrame(raf);
      activeTween = null;
      reject(abortError());
    }, { once: true });

    // Animation step function, called on each frame
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
const fireMouseEvents = async (element: Element, eventNames: string[], x: number, y: number, delayBetweenEventsMs: number = 100, signal?: AbortSignal) => {
  for (let i = 0; i < eventNames.length; i++) {
    const eventName = eventNames[i];
    fireMouseEvent(element, eventName, x, y);
    // If there is a next event, wait a bit before firing it to simulate natural user interaction
    if (i < eventNames.length - 1) {
      await wait(delayBetweenEventsMs, signal);
    }
  }
};

/**
 * Simulates a click at the specified coordinates on the given element,
 * optionally using 'mousedown' and 'mouseup' events instead of a single 'click' event.
 */
export const clickElement = async (element: Element, x: number, y: number, useMouseDownAndUp: boolean = false, signal?: AbortSignal) => {
  await moveGhostCursorTo(x, y, signal);
  if (useMouseDownAndUp) {
    await fireMouseEvents(element, ['mousedown', 'mouseup'], x, y, 100, signal);
  } else {
    fireMouseEvent(element, 'click', x, y);
  }
  // Move cursor away a bit after the click for better visibility of the click effect
  // This is not `await`ed because we don't want to delay the next action
  moveGhostCursorTo(x + 5, y + 10);
};

/**
 * Uses the ghost cursor to simulate a click on the center of the given element.
 * Optionally simulates a hover state by adding a "hover" class to the element shortly before the click.
 * (The exact time when the "hover" class does not match the element's actual bounding box.)
 */
export const clickElementCenter = async (element: Element, simulateHover: boolean = false, signal?: AbortSignal) => {
  const r = element.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (simulateHover) {
    // Add "hover" class a little before the click to simulate a hover state, which can be useful for demo purposes
    const animationDuration = ghostCursorAnimationDurationByTarget(x, y);
    setTimeout(() => element.classList.add('hover'), animationDuration * 0.5);
    setTimeout(() => { if (element) element.classList.remove('hover'); }, animationDuration * 1.1);
  }
  await clickElement(element, x, y, false, signal);
};

/**
 * Waits for the specified input element to receive focus, checking periodically and forcing focus after a certain number of attempts.
 */
export const waitForFocus = async (
  inputElement: HTMLInputElement,
  signal?: AbortSignal,
  attemptsBeforeForce: number = 3,
  intervalBetweenAttemptsMs: number = 100,
): Promise<void> => new Promise((resolve, reject) => {
  let attempts = 0;

  const checkFocus = () => {
    if (signal?.aborted) { reject(abortError()); return; }
    if (document.activeElement === inputElement) {
      resolve();
    } else {
      attempts++;
      if (attempts >= attemptsBeforeForce) {
        inputElement.focus();
        setTimeout(() => {
          if (signal?.aborted) { reject(abortError()); return; }
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
export const typeIntoInput = async (
  inputElement: HTMLInputElement,
  text: string,
  signal?: AbortSignal,
  keystrokeDelayMs: number = 60,
  keystrokeDelayVarianceMs: number = 40,
  keystrokeDelayBeforeChars: { [char: string]: number } = { ' ': 200, '.': 300, ',': 300 },
) => {
  await waitForFocus(inputElement, signal);

  for (const char of text) {
    if (signal?.aborted) throw abortError();
    if (!document.body.contains(inputElement)) throw abortError();
    const delayVariance = Math.floor(Math.random() * keystrokeDelayVarianceMs * 2) - keystrokeDelayVarianceMs;
    const delayBefore = keystrokeDelayBeforeChars[char] || 0;
    if (delayBefore > 0) {
      await wait(delayBefore + delayVariance, signal);
    }
    inputElement.value += char;
    inputElement.dispatchEvent(new Event('input', { bubbles: true }));
    await wait(keystrokeDelayMs + delayVariance, signal);
  }
};

/**
 * Polls until the selector matches an element in the DOM, or throws AbortError on timeout or signal abort.
 * A timeout signals a cycle restart in runTour (DOM was disrupted by user interaction).
 */
export const waitForElement = async <T extends Element>(
  selector: string,
  signal: AbortSignal,
  timeoutMs: number = 1000,
): Promise<T> => {
  // After this deadline, the DOM is expected to have stabilized.
  // If the element is not found by then, it's likely due to user interaction disrupting the DOM,
  // and we should abort this cycle and restart the step.
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (signal.aborted) throw abortError();
    const el = document.querySelector<T>(selector);
    if (el) return el;
    await wait(50, signal);
  }
  // If the element is still not found after the timeout, abort the current cycle.
  throw abortError();
};
