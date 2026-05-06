import { useEffect, useState } from 'react';

/**
 * Hook to track the state of a modifier key (Alt, Shift, Control, or Meta).
 */
const useModifierKey = (key: 'Alt' | 'Shift' | 'Control' | 'Meta'): boolean => {
  const [isHeld, setIsHeld] = useState(false);

  useEffect(() => {
    // Register event listeners for keydown and keyup to track the state of the modifier key
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === key) setIsHeld(true); };
    const onKeyUp = (e: KeyboardEvent) => { if (e.key === key) setIsHeld(false); };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    // Also listen for window blur to reset the state if the user switches away from the window while holding the key
    // This is necessary because we won't receive the keyup event in that case,
    // which would leave us stuck in the "held" state until the user presses and releases the key again
    const onWindowBlur = () => setIsHeld(false);
    window.addEventListener('blur', onWindowBlur);

    return () => {
      // Clean up event listeners on unmount
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onWindowBlur);
    };
  }, [key]);

  return isHeld;
};

export default useModifierKey;
