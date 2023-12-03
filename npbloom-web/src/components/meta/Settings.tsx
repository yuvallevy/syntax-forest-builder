import { useContext } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Checkbox, Group, Modal, Stack } from '@mantine/core';
import { SetAutoFormatSubscript, SetLiveStringWidth } from 'npbloom-core';
import { useDisclosure } from '@mantine/hooks';
import { IconAdjustmentsHorizontal } from '@tabler/icons-react';
import SettingsStateContext from "../../SettingsStateContext";
import useHotkeys from '@reecelucas/react-use-hotkeys';

const Settings: React.FC = () => {
  const { t } = useTranslation();

  const [opened, { open, close }] = useDisclosure(false);
  const { settingsState, settingsDispatch } = useContext(SettingsStateContext);

  useHotkeys(['Control+,', 'Meta+,'], event => { event.preventDefault(); open(); },
    { ignoredElementWhitelist: ['INPUT'] });

  return <>
    <Button
      variant="subtle"
      size="xs"
      onClick={open}
    >
      <IconAdjustmentsHorizontal stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }} />&nbsp; {t('mainMenu.settings.title')}
    </Button>
    <Modal centered title="Settings" size="lg" opened={opened} onClose={close}>
      <Stack>
        <Checkbox
          label={t('settings.items.autoFormatBracketsAsSubscript.title')}
          description={t('settings.items.autoFormatBracketsAsSubscript.description')}
          checked={settingsState.autoFormatSubscript}
          onChange={(event) => settingsDispatch(new SetAutoFormatSubscript(event.currentTarget.checked))}
        />
        <Checkbox
          label={t('settings.items.experimentalTextWidth.title')}
          checked={settingsState.liveStringWidth}
          onChange={(event) => settingsDispatch(new SetLiveStringWidth(event.currentTarget.checked))}
        />
        <Group position="right">
          <Button variant="subtle" onClick={close}>{t('settings.buttons.done')}</Button>
        </Group>
      </Stack>
    </Modal>
  </>;
};

export default Settings;
