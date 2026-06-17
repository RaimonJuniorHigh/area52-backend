import { describe, it, expect } from 'vitest';
import { canRent, canParticipate } from '../validations/age';

describe('canRent', () => {
  it('returns false when age is below 18', () => {
    expect(canRent({ name: 'Test', age: 17 })).toBe(false);
  });

  it('returns true when age is 18 or above', () => {
    expect(canRent({ name: 'Test', age: 18 })).toBe(true);
  });
});

describe('canParticipate', () => {
  it('returns false when age is below minAge', () => {
    expect(canParticipate({ name: 'Test', age: 15 }, 16)).toBe(false);
  });

  it('returns true when age meets minAge', () => {
    expect(canParticipate({ name: 'Test', age: 16 }, 16)).toBe(true);
  });
});