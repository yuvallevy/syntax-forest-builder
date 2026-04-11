import { useState } from 'react';
import { modals } from '@mantine/modals';
import useUiState from '../useUiState.ts';
import { openFileNative, saveFileNative } from './systemFileIoImpl.ts';
import { LoadContentState, contentStateFromFileContents, contentStateToFileContents } from 'npbloom-core';

/* Note: Kotlin's ByteArray gets compiled to Int8Array in JS, but the browser's File System API uses Uint8Array
 * so we need to convert between the two each time. */

const useSystemFileIo = () => {
  const { state, dispatch } = useUiState();
  const [activeFileName, setActiveFileName] = useState<string>();

  const openSystemFileSaveModal = async () => {
    const data = contentStateToFileContents(state.contentState.current);
    try {
      const fileName = await saveFileNative(new Uint8Array(data), activeFileName);
      setActiveFileName(fileName);
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        modals.open({
          title: 'Error saving file',
          children: <div>{e.message || 'An unknown error occurred while saving the file.'}</div>,
          centered: true,
        });
      }
    }
  };

  const openSystemFileLoadModal = async () => {
    try {
      const [fileName, data] = await openFileNative();
      const contentState = contentStateFromFileContents(new Int8Array(data));
      setActiveFileName(fileName);
      dispatch(new LoadContentState(contentState));
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        modals.open({
          title: 'Error loading file',
          children: <div>{e.message || 'An unknown error occurred while loading the file.'}</div>,
          centered: true,
        });
      }
      return;
    }
  };

  return {
    openSystemFileSaveModal,
    openSystemFileLoadModal,
  };
};

export default useSystemFileIo;
