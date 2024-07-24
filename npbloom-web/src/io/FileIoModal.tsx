import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import prettyDate from './prettyDate';
import { ActionIcon, Button, Group, Modal, Popover, ScrollArea, Table, Text, TextInput } from '@mantine/core';
import { useInputState } from '@mantine/hooks';
import { IconCheck, IconEdit, IconTrash, IconX } from '@tabler/icons-react';
import { FileWithMetadata } from './fileIoImpl';
import prettyBytes from 'pretty-bytes';
import './FileIoModal.scss';

interface FileIoModalProps {
  opened: boolean;
  fileList: FileWithMetadata[];
  interactionMode: 'save' | 'load';
  activeFileName?: string;
  onSave: (fileName: string) => Promise<void>;
  onLoad: (fileName: string) => Promise<void>;
  onRename: (oldFileName: string, newFileName: string) => Promise<void>;
  onDelete: (fileName: string) => Promise<void>;
  onClose: () => void;
}

const compareFileNames = (locale: string) => (file1: FileWithMetadata, file2: FileWithMetadata) =>
  Intl.Collator(locale).compare(file1.name, file2.name);

const FileIoModal: React.FC<FileIoModalProps> = ({
  opened,
  fileList,
  interactionMode,
  activeFileName,
  onSave,
  onLoad,
  onRename,
  onDelete,
  onClose,
}) => {
  const { t, i18n } = useTranslation();

  const [fileNameInputValue, setFileNameInputValue] = useState('');
  const fileNameInputRef = useRef<HTMLInputElement>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'loading' | 'success' | Error>('idle');

  const [renamingFile, setRenamingFile] = useState<string>();
  const [newFileName, setNewFileName] = useInputState<string>('');
  const newFileNameInputRef = useRef<HTMLInputElement>(null);
  const [renamingStatus, setRenamingStatus] = useState<Error>();

  const sortedFileList = useMemo(() => fileList.sort(compareFileNames(i18n.language)), [fileList, i18n.language]);

  useEffect(() => {
    if (opened) {
      setSavingStatus('idle');
      if (interactionMode === 'save') setTimeout(() => fileNameInputRef.current?.focus(), 100);
    }
  }, [opened, interactionMode]);
  useEffect(() => setFileNameInputValue(activeFileName ?? ''), [activeFileName]);

  const handleSaveClicked = (event: React.FormEvent) => {
    setRenamingStatus(undefined);
    event.preventDefault();
    onSave(fileNameInputValue)
      .then(() => setSavingStatus('success'))
      .catch((error: Error) => setSavingStatus(error));
  };

  const handleRename = (oldFileName: string, newFileName: string) => {
    setRenamingStatus(undefined);
    if (newFileName && newFileName !== oldFileName) onRename(oldFileName, newFileName)
      .then(closeNewFileNamePrompt)
      .catch(setRenamingStatus);
    else closeNewFileNamePrompt();
  };

  const openNewFileNamePrompt = (oldFileName: string) => {
    setRenamingFile(renamingFile === oldFileName ? undefined : oldFileName);
    setNewFileName(oldFileName);
    setRenamingStatus(undefined);
    setTimeout(() => newFileNameInputRef.current?.focus(), 20);
  };

  const closeNewFileNamePrompt = () => {
    setRenamingFile(undefined);
    setNewFileName(undefined);
    setRenamingStatus(undefined);
  }

  return <Modal
    size="xl"
    opened={opened}
    title={interactionMode === 'load' ? t('fileIo.title.open') : t('fileIo.title.save')}
    centered
    onClose={onClose}
  >
    <ScrollArea h={400}>
      <Table highlightOnHover={interactionMode === 'load'}>
        <thead>
        <tr>
          <th>{t('fileIo.listHeaders.name')}</th>
          <th style={{ width: '12ch' }}>{t('fileIo.listHeaders.size')}</th>
          <th style={{ width: '24ch' }}>{t('fileIo.listHeaders.modified')}</th>
          <th style={{ width: '10ch' }}></th>
        </tr>
        </thead>
        <tbody>
          {sortedFileList.map((file) => <tr key={file.name} className="FileIoModal--file-row">
            <td
              style={{ cursor: interactionMode === 'load' ? 'pointer' : 'unset' }}
              onClick={interactionMode === 'load'
                ? ((event) => event.currentTarget === event.target ? onLoad(file.name) : undefined)
                : undefined}
            >
              {renamingFile === file.name
                ? <form onSubmit={(event) => { event.preventDefault(); handleRename(file.name, newFileName); }}>
                  <Popover opened={!!renamingStatus} position="bottom-start" withArrow offset={0}>
                    <Popover.Target>
                      <TextInput ref={newFileNameInputRef} classNames={{ root: "FileIoModal--new-file-name-input" }} p="xs" value={newFileName} onInput={setNewFileName} />
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Text color="red">{renamingStatus?.message}</Text>
                    </Popover.Dropdown>
                  </Popover>
                </form>
                : file.name}
            </td>
            <td><bdo dir="ltr">{prettyBytes(file.size, { locale: i18n.language })}</bdo></td>
            <td>{prettyDate(file.modifiedTime, i18n.language)}</td>
            <td>
              {renamingFile
                ? <Group spacing="xs" position="right" className="FileIoModal--file-actions">
                  <ActionIcon variant="gradient" onClick={() => handleRename(file.name, newFileName)}>
                    <IconCheck size={18} />
                  </ActionIcon>
                  <ActionIcon onClick={closeNewFileNamePrompt}>
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
                : <Group spacing="xs" position="right" className="FileIoModal--file-actions">
                  <ActionIcon onClick={() => openNewFileNamePrompt(file.name)}>
                    <IconEdit size={18} />
                  </ActionIcon>
                  <Popover position="left" withArrow>
                    <Popover.Target>
                      <ActionIcon color="red">
                        <IconTrash size={18} />
                      </ActionIcon>
                    </Popover.Target>
                    <Popover.Dropdown>
                      <Button size="sm" p="sm" color="red" onClick={() => onDelete(file.name)}>
                        {t('fileIo.buttons.confirmDelete')}
                      </Button>
                    </Popover.Dropdown>
                  </Popover>
                </Group>}
            </td>
          </tr>)}
        </tbody>
      </Table>
    </ScrollArea>
    {interactionMode === 'save' && <>
      <form onSubmit={handleSaveClicked}>
        <Group>
          <label htmlFor="filename">{t('fileIo.labels.fileName')}</label>
          <TextInput
            ref={fileNameInputRef}
            id="filename"
            value={fileNameInputValue}
            autoFocus
            style={{ flexGrow: 1 }}
            onChange={(event) => setFileNameInputValue(event.currentTarget.value)}
          />
          <Button type="submit" disabled={savingStatus === 'loading' || fileNameInputValue.trim() === ''}>
            {t('fileIo.buttons.save')}
          </Button>
        </Group>
      </form>
      {savingStatus instanceof Error && <Text>Error saving file: {savingStatus.message}</Text>}
    </>}
  </Modal>;
};

export default FileIoModal;
