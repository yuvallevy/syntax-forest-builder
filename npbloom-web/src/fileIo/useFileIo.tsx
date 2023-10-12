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

  const refreshFileList = () => {
    if (db.current) getFileMetadataList(db.current).then(setFileList);
    else openFileDatabase().then(it => {
      db.current = it;
      getFileMetadataList(db.current).then(setFileList);
    });
  };

  useEffect(() => {
    if (fileIoModalOpened) refreshFileList();
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
    assertDbConnected(db =>
      saveContentStateToFile(db, state.contentState.current, fileName)
        .then(() => {
          setActiveFileName(fileName);
          closeFileIoModal();
        }));

  const handleLoad = (fileName: string): Promise<void> =>
    assertDbConnected(db =>
      loadContentStateFromFile(db, fileName)
        .then(contentState => {
          setActiveFileName(fileName);
          dispatch(new LoadContentState(contentState))
          closeFileIoModal();
        }));

  const handleRename = (oldFileName: string, newFileName: string): Promise<void> =>
    assertDbConnected(db => renameFile(db, oldFileName, newFileName).then(refreshFileList));

  const handleDelete = (fileName: string): Promise<void> =>
    assertDbConnected(db => deleteFile(db, fileName).then(refreshFileList));

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
