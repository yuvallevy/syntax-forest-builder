import { useEffect, useRef, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { modals } from '@mantine/modals';
import useUiState from '../useUiState';
import { LoadContentState } from 'npbloom-core';
import {
  deleteFile,
  FileWithMetadata,
  getFileMetadataList,
  loadContentStateFromFile,
  openFileDatabase,
  renameFile,
  saveContentStateToFile
} from './browserFileIoImpl';
import BrowserFileIoModal from './BrowserFileIoModal';

const useBrowserFileIo = () => {
  const { state, dispatch } = useUiState();
  const db = useRef<IDBDatabase>();
  const [browserFileIoModalOpened, { open: openFileIoModal, close: closeFileIoModal }] = useDisclosure(false);
  const [fileList, setFileList] = useState<FileWithMetadata[]>([]);
  const [interactionMode, setInteractionMode] = useState<'save' | 'load'>('load');
  const [activeFileName, setActiveFileName] = useState<string>();

  const refreshFileList = async () => {
    if (!db.current) {
      db.current = await openFileDatabase();
    }
    setFileList(await getFileMetadataList(db.current));
  };

  useEffect(() => {
    if (browserFileIoModalOpened) void refreshFileList();
  }, [browserFileIoModalOpened]);

  const openFileSaveModal = () => {
    setInteractionMode('save');
    openFileIoModal();
  };

  const openFileLoadModal = () => {
    setInteractionMode('load');
    openFileIoModal();
  };

  const assertDbConnected = (fn: (db: IDBDatabase) => Promise<void>): Promise<void> =>
    !db.current ? new Promise((_, reject) => reject(new Error('File database not connected')))
      : fn(db.current);

  const handleSave = (fileName: string): Promise<void> =>
    assertDbConnected(async db => {
      try {
        await saveContentStateToFile(db, state.contentState.current, fileName);
        setActiveFileName(fileName);
        closeFileIoModal();
      } catch (e: any) {
        modals.open({
          title: 'Error saving file',
          children: <div>{e.message || 'An unknown error occurred while saving the file.'}</div>,
          centered: true,
        });
      }
    });

  const handleLoad = (fileName: string): Promise<void> =>
    assertDbConnected(async db => {
      try {
        const contentState = await loadContentStateFromFile(db, fileName);
        setActiveFileName(fileName);
        dispatch(new LoadContentState(contentState));
        closeFileIoModal();
      } catch (e: any) {
        modals.open({
          title: 'Error loading file',
          children: <div>{e.message || 'An unknown error occurred while loading the file.'}</div>,
          centered: true,
        });
      }
    });

  const handleRename = (oldFileName: string, newFileName: string): Promise<void> =>
    assertDbConnected(async db => {
      await renameFile(db, oldFileName, newFileName);
      await refreshFileList();
    });

  const handleDelete = (fileName: string): Promise<void> =>
    assertDbConnected(async db => {
      await deleteFile(db, fileName);
      await refreshFileList();
    });

  const saveOrSaveAs = () => activeFileName ? handleSave(activeFileName) : openFileSaveModal();

  const browserFileIoModalComponent = <BrowserFileIoModal
    opened={browserFileIoModalOpened}
    fileList={fileList}
    interactionMode={interactionMode}
    activeFileName={activeFileName}
    onSave={handleSave}
    onLoad={handleLoad}
    onRename={handleRename}
    onDelete={handleDelete}
    onClose={closeFileIoModal}
  />;

  return {
    browserFileIoModalComponent,
    activeFileName,
    openFileSaveModal,
    openFileLoadModal,
    saveOrSaveAs,
  };
};

export default useBrowserFileIo;
