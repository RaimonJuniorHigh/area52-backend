export interface Rental {
  rentalId: number;
  guestId: number;
  bikeId: number;
  rentalDate: Date;
  returnDate: Date | null;
  status: 'reserved' | 'active' | 'completed' | 'cancelled';
  totalPrice: number;
}
