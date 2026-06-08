import { useEffect, useRef, useState } from 'react';
import { guidedTourSteps, UiAction } from 'npbloom-core';
import runTour from './runTour';

type TourPhase =
  | { phase: 'animating'; stepIndex: number }
  | { phase: 'waiting'; stepIndex: number }
  | { phase: 'complete' };

const useTour = (dispatch: React.Dispatch<UiAction>, onComplete: () => void) => {
  const [tourPhase, setTourPhase] = useState<TourPhase>({ phase: 'animating', stepIndex: 0 });

  const alertRef = useRef<HTMLDivElement>(null);
  const advanceTourRef = useRef<(() => void) | null>(null);
  const hasFadedOutRef = useRef(false);
  const hasFadedInRef = useRef(false);

  useEffect(() => {
    const { advance } = runTour(
      dispatch,
      (stepIndex) => {
        setTourPhase({ phase: 'animating', stepIndex });
      },
      (stepIndex) => {
        if (stepIndex === -1) {
          setTourPhase({ phase: 'complete' });
        } else {
          setTourPhase({ phase: 'waiting', stepIndex });
        }
      },
    );
    advanceTourRef.current = advance;
  }, [dispatch]);

  useEffect(() => {
    if ((tourPhase.phase === 'animating' || tourPhase.phase === 'waiting')
      && hasFadedOutRef.current
      && !hasFadedInRef.current) {
      hasFadedInRef.current = true;
      alertRef.current?.style.setProperty('animation-name', 'fadeIn');
    }
  }, [tourPhase]);

  useEffect(() => {
    if (tourPhase.phase === 'complete') {
      onComplete();
    }
  }, [tourPhase, onComplete]);

  const handleNext = async () => {
    hasFadedOutRef.current = true;
    hasFadedInRef.current = false;
    alertRef.current?.style.setProperty('animation-name', 'fadeOut');
    await new Promise(resolve => setTimeout(resolve, 500));
    advanceTourRef.current?.();
  };

  const steps = guidedTourSteps.get();
  const stepIndex = tourPhase.phase !== 'complete' ? tourPhase.stepIndex : -1;
  const currentStep = stepIndex >= 0 ? steps[stepIndex] : undefined;
  const isLastStep = stepIndex === steps.length - 1;

  return { tourPhase, alertRef, handleNext, currentStep, isLastStep };
};

export default useTour;
