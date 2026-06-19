import { Bike, calculateTotalPrice } from './Bike';
import { Rental } from './Rental';

let rentalIdCounter = 1;

export function createRentalLog(bike: Bike, guestId: number, days: number): Rental {
  const rental: Rental = {
    rentalId: rentalIdCounter++,
    guestId: guestId,
    bikeId: bike.id,
    rentalDate: new Date(),
    returnDate: null,
    status: 'active',
    totalPrice: calculateTotalPrice(bike, days),
  };

  console.log('Rental log created:', rental);
  return rental;
}