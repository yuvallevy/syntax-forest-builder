import './strWidthByMeasure.scss';

const MEASUREMENT_ELEMENT_ID = 'text-measurement';

const cache: Record<string, number> = {};

const createMeasurementElement = (): HTMLElement => {
  const measurementElement: HTMLElement = document.createElement('span');
  measurementElement.id = MEASUREMENT_ELEMENT_ID;
  document.body.appendChild(measurementElement);
  return measurementElement;
};

/**
 * Returns the width of the given text, in pixels. May return non-integer values.
 */
const strWidthByMeasure = (str: string): number => {
  if (str === '') return 0;

  if (cache[str]) return cache[str];

  const measurementElement = document.getElementById(MEASUREMENT_ELEMENT_ID) || createMeasurementElement();
  measurementElement.textContent = str;
  const width = measurementElement.getBoundingClientRect().width;
  cache[str] = width;
  return width;
};

export default strWidthByMeasure;
