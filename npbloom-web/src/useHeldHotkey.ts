import { useEffect } from 'react';

const useHeldHotkey = (
  hotkey: string,
  keydownCallback: (event: KeyboardEvent) => void,
  keyupCallback: (event: KeyboardEvent) => void,
) => {
  useEffect(() => {
    const keydownListener = (event: KeyboardEvent) => event.key === hotkey ? keydownCallback(event) : undefined;
    const keyupListener = (event: KeyboardEvent) => event.key === hotkey ? keyupCallback(event) : undefined;
    window.addEventListener('keydown', keydownListener);
    window.addEventListener('keyup', keyupListener);
    return () => {
      window.removeEventListener('keydown', keydownListener);
      window.removeEventListener('keyup', keyupListener);
    };
  }, [hotkey, keydownCallback, keyupCallback]);
};

export default useHeldHotkey;
