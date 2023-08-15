import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import SentenceView from '../../../ui/components/SentenceView';
import { CoordsInPlot, EntitySet, PositionedTree } from 'npbloom-core';

describe('sentence rendering', () => {
  const tree = new PositionedTree(
    'IOVaVs',
    'Noun verb phrases.',
    EntitySet.of([]),
    new CoordsInPlot(-100, 20),
    123,
  );

  it('renders an input box with the sentence', () => {
    expect(render(
      <SentenceView tree={tree} treeId="t123456" onBlur={() => null} onChange={() => null} onSelect={() => null} onKeyDown={() => null} />
    ).asFragment()).toMatchSnapshot();
  });
});
