export interface Rental {
  rentalId: number;
  bikeId: number;
  renter: string;
  rentalDate: Date;
  returnDate: Date | null;
  status: 'reserved' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
}
