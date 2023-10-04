import React, { useEffect, useRef, useState } from 'react';
import { Button, Group, Modal, ScrollArea, Table, Text, TextInput } from '@mantine/core';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { FileWithMetadata } from './fileIoImpl';

interface FileIoModalProps {
  opened: boolean;
  fileList: FileWithMetadata[];
  interactionMode: 'save' | 'load';
  activeFileName?: string;
  onSave: (fileName: string) => Promise<void>;
  onLoad: (fileName: string) => Promise<void>;
  onClose: () => void;
}

const FileIoModal: React.FC<FileIoModalProps> = ({
  opened,
  fileList,
  interactionMode,
  activeFileName,
  onSave,
  onLoad,
  onClose,
}) => {
  const [fileNameInputValue, setFileNameInputValue] = useState('');
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'loading' | 'success' | Error>('idle');

  useEffect(() => {
    if (opened) {
      setSavingStatus('idle');
      if (interactionMode === 'save') setTimeout(() => fileNameInputRef.current?.focus(), 100);
    }
  }, [opened, interactionMode]);
  useEffect(() => setFileNameInputValue(activeFileName ?? ''), [activeFileName]);

  const handleSaveClicked = (event: React.FormEvent) => {
    event.preventDefault();
    onSave(fileNameInputValue)
      .then(() => setSavingStatus('success'))
      .catch((error: Error) => setSavingStatus(error));
  };

  return <Modal
    size="xl"
    opened={opened}
    title={interactionMode === 'load' ? 'Open' : 'Save'}
    centered
    onClose={onClose}
  >
    <ScrollArea h={400}>
      <Table highlightOnHover={interactionMode === 'load'}>
        <thead>
        <tr>
          <th>Name</th>
          <th style={{ width: '12ch' }}>Size</th>
          <th style={{ width: '24ch' }}>Modified</th>
        </tr>
        </thead>
        <tbody>
        {fileList.map(file => {
          return <tr
            key={file.name}
            style={{ cursor: interactionMode === 'load' ? 'pointer' : 'unset' }}
            onClick={interactionMode === 'load' ? () => onLoad(file.name) : undefined}
          >
            <td>{file.name}</td>
            <td>{file.size}</td>
            <td>{file.modifiedTime.toLocaleString()}</td>
          </tr>;
        })}
        </tbody>
      </Table>
    </ScrollArea>
    {interactionMode === 'save' && <>
      <form onSubmit={handleSaveClicked}>
        <Group>
          <TextInput
            ref={fileNameInputRef}
            value={fileNameInputValue}
            autoFocus
            style={{ flexGrow: 1 }}
            onChange={(event) => setFileNameInputValue(event.currentTarget.value)}
          />
          <Button type="submit" disabled={savingStatus === 'loading' || fileNameInputValue.trim() === ''}>
            <IconDeviceFloppy stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }}/>&nbsp; Save
          </Button>
        </Group>
      </form>
      {savingStatus instanceof Error && <Text>Error saving file: {savingStatus.message}</Text>}
    </>}
  </Modal>;
};

export default FileIoModal;
