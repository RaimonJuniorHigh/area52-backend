export interface Activity {
  name: string;
  currentParticipants: number;
  maxParticipants: number;
  minAge: number;
}

export function hasCapacity(Activity: Activity): boolean {
  return Activity.currentParticipants < Activity.maxParticipants;
}