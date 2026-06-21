export interface Bike {
  id: number;
  name: string;
  type: 'bike' | 'electric bike' | 'racebike' | 'mountainbike';
  isRented: boolean;
  pricePerDay: number;
  deposit: number;
  image: string;
}

export const bikes: Bike[] = [
  { id: 1,  name: 'Fontana',     type: 'racebike',      isRented: false, pricePerDay: 35, deposit: 200, image: '/bike-images/Fontana.webp' },
  { id: 2,  name: 'Gazelle',     type: 'electric bike', isRented: false, pricePerDay: 28, deposit: 150, image: '/bike-images/Gazelle.webp' },
  { id: 3,  name: 'Batavus',     type: 'bike',          isRented: false, pricePerDay: 12, deposit: 50,  image: '/bike-images/Batavus.webp' },
  { id: 4,  name: 'Giant',       type: 'mountainbike',  isRented: false, pricePerDay: 30, deposit: 175, image: '/bike-images/Giant.webp' },
  { id: 5,  name: 'Specialized', type: 'racebike',      isRented: false, pricePerDay: 40, deposit: 250, image: '/bike-images/Specialized.webp' },
  { id: 6,  name: 'Trek',        type: 'mountainbike',  isRented: false, pricePerDay: 32, deposit: 180, image: '/bike-images/Trek.webp' },
  { id: 7,  name: 'Cortina',     type: 'bike',          isRented: false, pricePerDay: 15, deposit: 60,  image: '/bike-images/Cortina.webp' },
  { id: 8,  name: 'Koga',        type: 'electric bike', isRented: false, pricePerDay: 30, deposit: 150, image: '/bike-images/Koga.webp' },
  { id: 9,  name: 'Merida',      type: 'mountainbike',  isRented: false, pricePerDay: 28, deposit: 170, image: '/bike-images/Merida.webp' },
  { id: 10, name: 'Raleigh',     type: 'bike',          isRented: false, pricePerDay: 18, deposit: 80,  image: '/bike-images/Raleigh.webp' },
];

export function calculateTotalPrice(bike: Bike, days: number): number {
  return bike.pricePerDay * days;
}

export function rentBike(bike: Bike): boolean {
  if (bike.isRented) return false;
  bike.isRented = true;
  return true;
}