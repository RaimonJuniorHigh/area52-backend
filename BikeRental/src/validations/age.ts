export const MIN_AGE_ACTIVITY = 16;
export const MIN_AGE_RENTAL = 18;

export interface Guest {
  name: string;
  age: number;
}

export function canParticipate(Guets: Guest): boolean {
  return Guets.age >= MIN_AGE_ACTIVITY;
}

export function canRent(Guets: Guest): boolean {
  return Guets.age >= MIN_AGE_RENTAL;
}
