import { describe, expect, it } from 'vitest';
import slicesOverlap from '../../content/slicesOverlap';
import { StringSlice } from '../../content/types';

describe('slice overlap checks', () => {
  it.each([
    [[0, 6], [8, 9], false],
    [[0, 6], [4, 9], true],
    [[0, 6], [6, 9], false],
    [[7, 9], [7, 7], false],
    [[7, 9], [9, 9], false],
    [[19, 23], [19, 25], true],
    [[19, 25], [19, 23], true],
    [[19, 23], [16, 25], true],
    [[19, 23], [16, 23], true],
    [[16, 23], [19, 23], true],
  ] as [StringSlice, StringSlice, boolean][])('returns whether %s and %s overlap',
    (slice1, slice2, expected) => expect(slicesOverlap(slice1, slice2)).toBe(expected));
});
