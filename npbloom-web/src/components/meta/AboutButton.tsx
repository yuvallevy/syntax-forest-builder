import { useTranslation } from 'react-i18next';
import { Anchor, Button, Modal } from '@mantine/core';
import { useEffect, useState } from 'react';
import { useDisclosure } from '@mantine/hooks';
import { IconInfoCircle } from '@tabler/icons-react';
import Logo from './npbloom-logo.svg';

const AboutButton = () => {
  const { t } = useTranslation();

  const [opened, { open, close }] = useDisclosure(false);

  // Only show the email address after a delay so scrapers have to work extra hard to pick it up
  const [contactEmailAddress, setContactEmailAddress] = useState('');
  useEffect(() => {
    setTimeout(() => setContactEmailAddress(window.atob('eXV2YWxAeXV2YWxpbmd1aXN0LnNwYWNl')), 2000);
  }, []);

  return <>
    <Button
      variant="subtle"
      size="sm"
      onClick={open}
    >
      <IconInfoCircle stroke={1} style={{ transform: 'translate(0.5px, 0.5px)' }} />&nbsp; {t('mainMenu.about.title')}
    </Button>
    <Modal opened={opened} onClose={close} title="About" centered size="lg">
      <div style={{ textAlign: 'center' }}>
        <img src={Logo} height={120} alt="NPBloom logo" />
      </div>
      <p>Build <strong>constituent trees</strong> for articles, lectures, homework etc.
        using an in-browser point-and-click interface.</p>
      <p>To begin, click anywhere and start typing a sentence.
        Click above the words to add nodes, and click above the nodes to add parent nodes,
        working your way up the tree.</p>
      <p>
        NPBloom is written in <Anchor href="https://kotlinlang.org/" target="_blank" rel="noopener noreferrer">
          Kotlin
        </Anchor> and <Anchor href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
          TypeScript
        </Anchor>, powered by <Anchor href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          React
        </Anchor> and <Anchor href="https://www.w3.org/Graphics/SVG/" target="_blank" rel="noopener noreferrer">
          SVG
        </Anchor>, and made prettier with <Anchor href="https://mantine.dev/" target="_blank" rel="noopener noreferrer">
          Mantine
        </Anchor> and <Anchor href="https://tabler-icons.io/" target="_blank" rel="noopener noreferrer">
          Tabler
        </Anchor>. Logo by <Anchor href="https://hadarorenart.wixsite.com/hrodesign" target="_blank">
          hro-arts
        </Anchor>. See <Anchor href="https://github.com/yuvallevy/syntax-forest-builder/blob/main" target="_blank" rel="noopener noreferrer">
          GitHub
        </Anchor> for full source code.
      </p>
      <p>
        For feedback, bug reports, or feature requests, please contact me at <b>{contactEmailAddress}</b>.
      </p>
      {import.meta.env.VITE_BUILD_TIMESTAMP && <p><small>Last updated {import.meta.env.VITE_BUILD_TIMESTAMP}.</small></p>}
    </Modal>
  </>;
};

export default AboutButton;
