/**
 * This file contains logic for handling mouse wheel interactions on the plot.
 * It is kept separate from `usePlotMouseInteractions` since mouse wheel interactions require some unique logic on
 * devices with trackpads.
 */

import { useEffect, useRef } from 'react';
import { ClientCoordsOffset, CoordsInClient, Pan, UiAction, Zoom } from 'npbloom-core';
import { SVG_X, SVG_Y } from '../uiDimensions';
import useUiState from '../useUiState';

/**
 * Throttles a callback to at most once per animation frame using requestAnimationFrame.
 */
const useThrottleByFrame = <A extends any[]>(callback: (...args: A) => void): ((...args: A) => void) => {
  /**
   * This flag is used to ensure we only schedule one call to the callback per animation frame.
   * Once a call is scheduled, we set this flag to true, and reset it to false when the scheduled call runs, allowing the next call to be scheduled.
   */
  const callPendingForNextFrame = useRef(false);

  /**
   * These arguments will be used to call the callback at the next animation frame.
   */
  const pendingArgs = useRef<A>();

  const throttledCallback = (...args: A) => {
    // Whenever the throttled callback is called, we update the pending arguments for the next call.
    // If the call is already scheduled, we don't need to do anything else,
    // since the scheduled call will use the most up-to-date arguments when it runs.
    pendingArgs.current = args;

    // If no call is scheduled for the next animation frame, we schedule one.
    if (!callPendingForNextFrame.current) {
      // First set the pending flag to true to prevent any more calls from being scheduled for this frame.
      callPendingForNextFrame.current = true;

      // Next, schedule a callback for the next animation frame.
      // The latest arguments will be used when this callback runs.
      requestAnimationFrame(() => {
        // We know pendingArgs.current is defined here, but since it's technically mutable, we should double check before calling the callback:
        if (pendingArgs.current) {
          callback(...pendingArgs.current);
          pendingArgs.current = undefined;
        }

        // We're now ready to schedule the next call:
        callPendingForNextFrame.current = false;
      });
    }
  };

  return throttledCallback;
};

const usePlotMouseWheelInteractions = (
  svgRef: React.RefObject<SVGSVGElement>,
) => {
  const { dispatch } = useUiState();

  /** Prevent pinch-zoom and ctrl+wheel zoom from also zooming the entire page,
   * since we're handling zooming within the plot ourselves. */
  useEffect(() => {
    const el = svgRef.current;
    if (!el) return;
    const handler = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) e.preventDefault();
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  /**
   * Returns the appropriate UiAction for a given wheel event, based on which modifier keys are pressed or how the event was triggered.
   */
  const determinePlotWheelAction = (event: React.WheelEvent<SVGElement>): UiAction => {
    // Ctrl+scroll or Cmd+scroll also cover pinch-zoom gestures on trackpads, so we can use the same logic for both
    if (event.ctrlKey || event.metaKey) {
      const relativeZoomFactor = 1 - event.deltaY / 100;
      return new Zoom(relativeZoomFactor, new CoordsInClient(event.clientX - SVG_X, event.clientY - SVG_Y));
    }
    
    // Shift+scroll for horizontal pan, for devices with a vertical-only scroll wheel (most mice)
    if (event.shiftKey) return new Pan(new ClientCoordsOffset(-event.deltaY, 0));
    
    // Regular pan, for trackpads and mice with horizontal scroll wheels
    return new Pan(new ClientCoordsOffset(-event.deltaX, -event.deltaY));
  };

  // Naive handler for wheel events that directly dispatches the corresponding action for each event.
  // This can lead to performance issues on devices that emit many wheel events per frame, such as trackpads.
  const handlePlotWheelNaive = (event: React.WheelEvent<SVGElement>) => dispatch(determinePlotWheelAction(event));

  // Throttling to one event per frame addresses the problem of too many events being emitted on some devices.
  // Zoom and pan actions will stay smooth even on those devices.
  const handlePlotWheelThrottled = useThrottleByFrame(handlePlotWheelNaive);

  return {
    handlePlotWheel: handlePlotWheelThrottled,
  };
};

export default usePlotMouseWheelInteractions;
