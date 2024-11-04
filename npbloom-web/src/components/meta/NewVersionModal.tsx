import { useEffect } from 'react';
import { Button, Group, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { changesFromPreviousVersion, currentVersion } from '../../currentVersion';

/**
 * Modal that shows the changes from the previous version to the current one,
 * if the user has previously been using an older version.
 */
const NewVersionModal = () => {
  const [opened, { open, close }] = useDisclosure(false);

  useEffect(() => {
    // lastVersion is the version the user was using in their last session
    const lastVersion = localStorage.getItem('nb_lastVersion');
    if (lastVersion && lastVersion !== currentVersion) {
      // Show the modal only if there are changes from the previous version we want to inform the user about
      if (changesFromPreviousVersion.length > 0) {
        open();
      }
      // Update the last version in the local storage
      localStorage.setItem('nb_lastVersion', currentVersion);
    } else if (!lastVersion) {
      // If there is no last version in the local storage, this is the first time the user is using the app
      localStorage.setItem('nb_lastVersion', currentVersion);
    }
  }, [open]);

  return <Modal
    opened={opened}
    centered
    size="lg"
    withCloseButton={false}
    onClose={close}
  >
    <p style={{ fontSize: 'large', fontWeight: 'bold' }}>You are now using NPBloom {currentVersion}!</p>
    <p>Changes from previous version:</p>
    <ul>
      {changesFromPreviousVersion.map((change, index) => <li key={index}>{change}</li>)}
    </ul>
    <Group position="right">
      <Button variant="subtle" onClick={close}>OK</Button>
    </Group>
  </Modal>;
}

export default NewVersionModal;
