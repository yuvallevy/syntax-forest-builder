import { StringSlice } from './types';

/**
 * Returns whether the given slices overlap.
 */
const slicesOverlap = ([start1, end1]: StringSlice, [start2, end2]: StringSlice) =>
  !(end1 < start1 || end2 < start2 || end1 <= start2 || end2 <= start1)

export default slicesOverlap;
