import { useEffect, useRef, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import useUiState from '../useUiState';
import { LoadContentState } from 'npbloom-core';
import {
  FileWithMetadata,
  getFileMetadataList,
  loadContentStateFromFile,
  openFileDatabase,
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

  useEffect(() => {
    if (fileIoModalOpened) {
      if (db.current) getFileMetadataList(db.current).then(setFileList);
      else openFileDatabase().then(it => {
        db.current = it;
        getFileMetadataList(db.current).then(setFileList);
      });
    }
  }, [fileIoModalOpened]);

  const openFileSaveModal = () => {
    setInteractionMode('save');
    openFileIoModal();
  };

  const openFileLoadModal = () => {
    setInteractionMode('load');
    openFileIoModal();
  };

  const handleSave = (fileName: string): Promise<void> =>
    !db.current ? new Promise((_, reject) => reject(Error('File database not connected')))
      : saveContentStateToFile(db.current, state.contentState.current, fileName)
        .then(() => {
          setActiveFileName(fileName);
          closeFileIoModal();
        });

  const handleLoad = (fileName: string): Promise<void> =>
    !db.current ? new Promise((_, reject) => reject(Error('File database not connected')))
      : loadContentStateFromFile(db.current, fileName)
        .then(contentState => {
          setActiveFileName(fileName);
          dispatch(new LoadContentState(contentState))
          closeFileIoModal();
        });

  const fileIoModalComponent = <FileIoModal
    opened={fileIoModalOpened}
    fileList={fileList}
    interactionMode={interactionMode}
    activeFileName={activeFileName}
    onSave={handleSave}
    onLoad={handleLoad}
    onClose={closeFileIoModal}
  />;

  return {
    fileIoModalComponent,
    activeFileName,
    openFileSaveModal,
    openFileLoadModal,
  };
};

export default useFileIo;
