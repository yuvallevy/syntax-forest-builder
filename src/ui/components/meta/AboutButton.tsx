import { Anchor, Button, Modal } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';

const AboutButton = () => {
  const [opened, { open, close }] = useDisclosure(false);

  return <>
    <Button
      variant="subtle"
      size="xs"
      sx={{ position: 'fixed', right: '1rem', top: '1rem' }}
      onClick={open}
    >
      0.3-preview2
    </Button>
    <Modal opened={opened} onClose={close} title="NPBloom" centered size="lg">
      <p>Build <strong>constituent trees</strong> for articles, lectures, homework etc.
        using an in-browser point-and-click interface.</p>
      <p>
        See <Anchor href="https://github.com/yuvallevy/syntax-forest-builder/blob/main/HISTORY.md">
          GitHub
        </Anchor> for full release notes.
      </p>
      <p>
        NPBloom is written in <Anchor href="https://www.typescriptlang.org/" target="_blank" rel="noopener noreferrer">
          TypeScript
        </Anchor>, powered by <Anchor href="https://react.dev/" target="_blank" rel="noopener noreferrer">
          React
        </Anchor> and <Anchor href="https://www.w3.org/Graphics/SVG/" target="_blank" rel="noopener noreferrer">
          SVG
        </Anchor>, and made prettier with <Anchor href="https://mantine.dev/" target="_blank" rel="noopener noreferrer">
          Mantine
        </Anchor> and <Anchor href="https://tabler-icons.io/" target="_blank" rel="noopener noreferrer">
          Tabler
        </Anchor>.<br />
      </p>
    </Modal>
  </>;
};

export default AboutButton;
