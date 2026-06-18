import { describe, it, expect } from 'vitest';
import { canRent, canParticipate } from '../validations/age';

describe('canRent', () => {
  it('returns false when age is below 18', () => {
    expect(canRent({ name: 'Test', age: 17 })).toBe(false);
  });

  it('returns true when age is exactly 18', () => {
    expect(canRent({ name: 'Test', age: 18 })).toBe(true);
  });

  it('returns true when age is well above 18', () => {
    expect(canRent({ name: 'Test', age: 100 })).toBe(true);
  });

  it('returns false when age is 0', () => {
    expect(canRent({ name: 'Test', age: 0 })).toBe(false);
  });

  it('returns false when age is negative', () => {
    expect(canRent({ name: 'Test', age: -1 })).toBe(false);
  });
});

describe('canParticipate', () => {
  it('returns false when age is below minAge', () => {
    expect(canParticipate({ name: 'Test', age: 15 }, 16)).toBe(false);
  });

  it('returns true when age meets minAge exactly', () => {
    expect(canParticipate({ name: 'Test', age: 16 }, 16)).toBe(true);
  });

  it('returns true when age is above minAge', () => {
    expect(canParticipate({ name: 'Test', age: 30 }, 16)).toBe(true);
  });

  it('returns false when age is 0', () => {
    expect(canParticipate({ name: 'Test', age: 0 }, 16)).toBe(false);
  });

  it('returns false when age is negative', () => {
    expect(canParticipate({ name: 'Test', age: -1 }, 16)).toBe(false);
  });
});