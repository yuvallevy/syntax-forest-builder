import { Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';

const Settings: React.FC = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return <>
    <Button
      variant="white"
      color="gray"
      size="xs"
      onClick={open}
    >
      <IconAdjustmentsHorizontal stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }} />&nbsp; Settings
    </Button>
    <Modal centered title="Settings" opened={opened} onClose={close}>
      Coming soon!
    </Modal>
  </>;
};

export default Settings;
