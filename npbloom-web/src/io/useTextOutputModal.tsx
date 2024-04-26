import { useState } from 'react';
import TextOutputModal from './TextOutputModal.tsx';

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
