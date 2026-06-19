import { Activity } from '../validations/capacity';

export interface Event extends Activity {
  eventId: number;
  startTime: string;
  endTime: string;
  location: string;
  image: string;
  price: number;
}

export const events: Event[] = [
  { eventId: 1, name: 'Yoga Morning', startTime: '08:00', endTime: '09:30', location: 'Sporthal A', currentParticipants: 5, maxParticipants: 20, minAge: 16, image: '/event-images/yoga.webp', price: 15 },
  { eventId: 2, name: 'Kickboxing', startTime: '10:00', endTime: '11:30', location: 'Sporthal B', currentParticipants: 10, maxParticipants: 10, minAge: 16, image: '/event-images/kickboxing.webp', price: 20 },
  { eventId: 3, name: 'Live Concert', startTime: '20:00', endTime: '22:00', location: 'Podium', currentParticipants: 50, maxParticipants: 200, minAge: 0, image: '/event-images/concert.webp', price: 25 },
];