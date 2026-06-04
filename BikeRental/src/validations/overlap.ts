export interface Booking {
  name: string;
  startTime: number;
  endTime: number;
}

export function hasOverlap(b1: Booking, b2: Booking): boolean {
  return b1.startTime < b2.endTime && b2.startTime < b1.endTime;
}
