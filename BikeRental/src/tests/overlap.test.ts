import { describe, it, expect } from 'vitest';
import { hasOverlap } from '../validations/overlap';

describe('hasOverlap', () => {
  it('returns true when timeslots overlap', () => {
    expect(hasOverlap(
      { name: 'Slot 1', startTime: 10, endTime: 12 },
      { name: 'Slot 2', startTime: 9, endTime: 11 }
    )).toBe(true);
  });

  it('returns false when timeslots do not overlap', () => {
    expect(hasOverlap(
      { name: 'Slot 1', startTime: 10, endTime: 12 },
      { name: 'Slot 2', startTime: 13, endTime: 15 }
    )).toBe(false);
  });
});