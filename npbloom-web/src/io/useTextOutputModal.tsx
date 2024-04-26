import { useState } from 'react';
import { UnpositionedTree } from 'npbloom-core';
import TextOutputModal from './TextOutputModal.tsx';

const useTextOutputModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [trees, setTrees] = useState<UnpositionedTree[]>([]);

  const openTextOutputModal = (trees: UnpositionedTree[]) => {
    setTrees(trees);
    setIsOpen(true);
  };

  const closeTextOutputModal = () => {
    setIsOpen(false);
  };

  const textOutputModalComponent = <TextOutputModal isOpen={isOpen} onClose={closeTextOutputModal} trees={trees} />;

  return { textOutputModalComponent, openTextOutputModal, closeTextOutputModal };
};

export default useTextOutputModal;
