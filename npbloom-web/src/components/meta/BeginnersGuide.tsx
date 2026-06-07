import { useEffect, useRef, useState } from 'react';
import { Alert, Group, useMantineTheme } from '@mantine/core';
import './BeginnersGuide.scss';
import {
  IconBabyCarriage, IconBinaryTree, IconChristmasTree, IconLadder, IconPencilPlus, IconPlant,
} from '@tabler/icons-react';
import runDemo from './demo/runDemo';

interface BeginnersGuideProps {
  acceptMouseEvents: boolean;
  onComplete: () => void;
}

const steps = [
  {
    icon: IconPlant,
    title: 'Click and type',
  },
  {
    icon: IconPencilPlus,
    title: 'Add a node for each word',
  },
  {
    icon: IconBabyCarriage,
    title: 'Give them parents',
  },
  {
    icon: IconBinaryTree,
    title: 'Branch out',
  },
  {
    icon: IconLadder,
    title: 'Up we go!',
  },
  {
    icon: IconChristmasTree,
    title: 'That\'s it!',
  },
];

const BeginnersGuide: React.FC<BeginnersGuideProps> = ({ onComplete, acceptMouseEvents }) => {
  const theme = useMantineTheme();

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);

  const beginnersGuideAlert = useRef<HTMLDivElement>(null);

  const handleNextStep = async () => {
    // Fade out the current alert, waiting for the animation to finish
    beginnersGuideAlert.current?.style.setProperty('animation-name', 'fadeOut');
    await new Promise(resolve => setTimeout(resolve, 500));

    // Move to the next step, or finish if there are no more steps
    // Setting currentStepIndex to -1 will signal that the demo is complete and the alert should be removed
    setCurrentStepIndex(prev => prev < steps.length - 1 ? prev + 1 : -1);

    if (currentStepIndex >= 0) {
      // Fade the new alert in
      beginnersGuideAlert.current?.style.setProperty('animation-name', 'fadeIn');
    }
  };

  useEffect(() => {
    runDemo(handleNextStep);
  }, [onComplete]);

  useEffect(() => {
    if (currentStepIndex === -1) {
      onComplete();
    }
  }, [currentStepIndex, onComplete]);

  const currentStep = steps[currentStepIndex];
  if (!currentStep) return null;

  return <div className="BeginnersGuide" style={{ pointerEvents: acceptMouseEvents ? 'auto' : 'none' }}>
    <Alert ref={beginnersGuideAlert} withCloseButton={false} radius="md" sx={{
      animationDuration: '0.5s',
      animationFillMode: 'forwards',
    }}>
      <Group spacing="md" sx={{
        color: theme.primaryColor,
        fontWeight: 'bold',
      }}>
        <currentStep.icon />
        <div>{currentStep.title}</div>
      </Group>
    </Alert>
  </div>;
};

export default BeginnersGuide;
