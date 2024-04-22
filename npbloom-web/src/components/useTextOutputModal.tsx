import React, { useEffect, useRef, useState } from 'react';
import { Button, Group, Modal, Textarea } from '@mantine/core';

interface TextOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  text: string;
}

const TextOutputModal: React.FC<TextOutputModalProps> = ({
  isOpen,
  onClose,
  text,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      textareaRef.current?.select();
      document.execCommand('copy');
    }
  };

  return (
    <Modal centered title="Output" size="lg" opened={isOpen} onClose={onClose}>
      <Textarea
        value={text}
        ref={textareaRef}
        readOnly
        minRows={10}
        sx={{ fontFamily: 'monospace' }}
        mb="1rem"
      />
      <Group position="apart">
        <Button variant="default" onClick={handleCopy}>Copy to clipboard</Button>
        <Button variant="filled" onClick={onClose}>Done</Button>
      </Group>
    </Modal>
  );
};

const useTextOutputModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [text, setText] = useState('');

  const openTextOutputModal = (text: string) => {
    setText(text);
    setIsOpen(true);
  };

  const closeTextOutputModal = () => {
    setIsOpen(false);
  };

  const textOutputModalComponent = <TextOutputModal isOpen={isOpen} onClose={closeTextOutputModal} text={text} />;

  return { textOutputModalComponent, openTextOutputModal, closeTextOutputModal };
};

export default useTextOutputModal;
