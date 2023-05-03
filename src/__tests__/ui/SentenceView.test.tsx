import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { PositionedTree } from '../../core/types';
import SentenceView from '../../ui/SentenceView';

describe('sentence rendering', () => {
  const tree: PositionedTree = {
    sentence: 'Noun verb phrases.',
    nodes: {},
    position: { plotX: -100, plotY: 20 },
    width: 123,
  };

  it('renders an input box with the sentence', () => {
    expect(render(
      <SentenceView tree={tree} treeId="t123456" onChange={() => null} onSelect={() => null} onKeyDown={() => null} />
    ).asFragment()).toMatchSnapshot();
  });
});
