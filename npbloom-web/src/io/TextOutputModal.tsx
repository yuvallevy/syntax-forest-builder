import React, { useEffect, useRef, useState } from 'react';
import { treeToLbn, UnpositionedTree } from 'npbloom-core';
import { Button, Group, Modal, Textarea } from '@mantine/core';
import './TextOutputModal.scss';

interface TextOutputModalProps {
  isOpen: boolean;
  onClose: () => void;
  trees: UnpositionedTree[];
}

const TextOutputModal: React.FC<TextOutputModalProps> = ({
  isOpen,
  onClose,
  trees,
}) => {
  const [text, setText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
      setText(trees.map(tree => treeToLbn(tree)).join('\n\n'));
      textareaRef.current?.focus();
      textareaRef.current?.select();
    }
  }, [trees, isOpen]);

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      textareaRef.current?.select();
      document.execCommand('copy');
    }
  };

  return (
    <Modal centered title="Export to text" size="lg" opened={isOpen} onClose={onClose}>
      <Textarea
        value={text}
        ref={textareaRef}
        readOnly
        minRows={10}
        className="TextOutputModal--textarea"
        mb="1rem"
      />
      <Group position="apart">
        <Button variant="default" onClick={handleCopy}>Copy to clipboard</Button>
        <Button variant="filled" onClick={onClose}>Done</Button>
      </Group>
    </Modal>
  );
};

export default TextOutputModal;
