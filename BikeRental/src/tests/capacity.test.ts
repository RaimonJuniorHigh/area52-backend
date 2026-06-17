import { describe, it, expect } from 'vitest';
import { hasCapacity } from '../validations/capacity';

describe('hasCapacity', () => {
  it('returns false when activity is full', () => {
    expect(hasCapacity({ name: 'Kickboxing', currentParticipants: 10, maxParticipants: 10, minAge: 16 })).toBe(false);
  });

  it('returns true when activity has space', () => {
    expect(hasCapacity({ name: 'Yoga', currentParticipants: 5, maxParticipants: 20, minAge: 16 })).toBe(true);
  });
});