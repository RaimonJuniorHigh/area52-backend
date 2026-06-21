export interface Activity {
  name: string;
  currentParticipants: number;
  maxParticipants: number;
  minAge: number;
}

export function hasCapacity(activity: Activity): boolean {
  return activity.currentParticipants < activity.maxParticipants;
}