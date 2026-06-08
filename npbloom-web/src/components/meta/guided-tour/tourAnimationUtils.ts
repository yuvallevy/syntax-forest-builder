import cursorImage from './demo-cursor.svg';

export const wait = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

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

export const removeGhostCursor = () => {
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

export const moveGhostCursorTo = (x: number, y: number): Promise<void> => {
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
export const clickElement = async (element: Element, x: number, y: number, useMouseDownAndUp: boolean = false) => {
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
export const clickElementCenter = async (element: Element, simulateHover: boolean = false) => {
  const r = element.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  if (simulateHover) {
    // Add "hover" class to a little before the click to simulate a hover state, which can be useful for demo purposes
    const animationDuration = ghostCursorAnimationDurationByTarget(x, y);
    setTimeout(() => element.classList.add('hover'), animationDuration * 0.5);
  }
  await clickElement(element, x, y);
};
