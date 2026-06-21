export interface TimeSlot {
  name: string;
  startTime: number;
  endTime: number;
}

export function hasOverlap(a: TimeSlot, b: TimeSlot): boolean {
  return a.startTime < b.endTime && b.startTime < a.endTime;
}