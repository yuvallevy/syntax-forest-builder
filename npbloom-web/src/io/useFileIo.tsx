import { useEffect, useRef, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
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
} from './fileIoImpl';
import FileIoModal from './FileIoModal';

const useFileIo = () => {
  const { state, dispatch } = useUiState();
  const db = useRef<IDBDatabase>();
  const [fileIoModalOpened, { open: openFileIoModal, close: closeFileIoModal }] = useDisclosure(false);
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
    if (fileIoModalOpened) void refreshFileList();
  }, [fileIoModalOpened]);

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
      await saveContentStateToFile(db, state.contentState.current, fileName);
      setActiveFileName(fileName);
      closeFileIoModal();
    });

  const handleLoad = (fileName: string): Promise<void> =>
    assertDbConnected(async db => {
      const contentState = await loadContentStateFromFile(db, fileName);
      setActiveFileName(fileName);
      dispatch(new LoadContentState(contentState));
      closeFileIoModal();
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

  const fileIoModalComponent = <FileIoModal
    opened={fileIoModalOpened}
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
    fileIoModalComponent,
    activeFileName,
    openFileSaveModal,
    openFileLoadModal,
    saveOrSaveAs,
  };
};

export default useFileIo;
