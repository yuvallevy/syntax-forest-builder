import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import SentenceView from '../../../ui/components/SentenceView';
import { PositionedTree } from '../../../content/positioned/types';

describe('sentence rendering', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verb phrases.',
    nodes: {},
    position: { plotX: -100, plotY: 20 },
    width: 123,
  };

  it('renders an input box with the sentence', () => {
    expect(render(
      <SentenceView tree={tree} treeId="t123456" onBlur={() => null} onChange={() => null} onSelect={() => null} onKeyDown={() => null} />
    ).asFragment()).toMatchSnapshot();
  });
});
