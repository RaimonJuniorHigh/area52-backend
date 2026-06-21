export const MIN_AGE_RENTAL = 18;

export interface GuestValidator {
  name: string;
  age: number;
}

export function canRent(guest: GuestValidator): boolean {
  return guest.age >= MIN_AGE_RENTAL;
}

export function canParticipate(guest: GuestValidator, minAge: number): boolean {
  return guest.age >= minAge;
}