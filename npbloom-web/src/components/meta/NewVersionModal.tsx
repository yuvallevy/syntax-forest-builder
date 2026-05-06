import { useEffect } from 'react';
import { Button, Group, Modal } from '@mantine/core';
import { changesFromPreviousVersion, currentVersion } from '../../currentVersion';
import './NewVersionModal.scss';

interface NewVersionModalProps {
  opened: boolean;
  onOpen: () => void;
  onClose: () => void;
}

/**
 * Modal that shows the changes from the previous version to the current one,
 * if the user has previously been using an older version.
 */
const NewVersionModal = ({
  opened,
  onOpen,
  onClose,
}: NewVersionModalProps) => {
  useEffect(() => {
    // lastVersion is the version the user was using in their last session
    const lastVersion = localStorage.getItem('nb_lastVersion');
    if (lastVersion && lastVersion !== currentVersion) {
      // Show the modal only if there are changes from the previous version we want to inform the user about
      if (changesFromPreviousVersion.length > 0) {
        onOpen();
      }
      // Update the last version in the local storage
      localStorage.setItem('nb_lastVersion', currentVersion);
    } else if (!lastVersion) {
      // If there is no last version in the local storage, this is the first time the user is using the app
      localStorage.setItem('nb_lastVersion', currentVersion);
    }
  }, [onOpen]);

  return <Modal
    opened={opened}
    centered
    size="lg"
    withCloseButton={false}
    onClose={onClose}
  >
    <p style={{ fontSize: 'large', fontWeight: 'bold' }}>What's new in NPBloom {currentVersion}</p>
    <p>Changes from previous version:</p>
    <ul className="NewVersionModal--changes">
      {changesFromPreviousVersion.map((change, index) => <li key={index}>{change}</li>)}
    </ul>
    <Group position="right">
      <Button variant="subtle" onClick={onClose}>OK</Button>
    </Group>
  </Modal>;
}

export default NewVersionModal;
