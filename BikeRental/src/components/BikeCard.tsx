import { Bike } from '../models/Bike';

interface Props {
  bike: Bike;
  onRent: (bike: Bike) => void;
}

const typeLabel: Record<string, string> = {
  'bike': 'Bike',
  'electric bike': 'Electric',
  'racebike': 'Racebike',
  'mountainbike': 'Mountainbike',
};

export default function BikeCard({ bike, onRent }: Props) {
  return (
    <div className={`card ${bike.isRented ? 'card--rented' : ''}`}>
      <div className="card__image-wrap">
        <img src={bike.image} alt={bike.name} loading="lazy" />
        <span className="card__badge card__badge--type">{typeLabel[bike.type]}</span>
        {bike.isRented && <span className="card__badge card__badge--rented">Rented</span>}
      </div>
      <div className="card__body">
        <h2 className="card__name">{bike.name}</h2>
        <div className="card__stats">
          <div className="stat">
            <span className="stat__label">Per day</span>
            <span className="stat__value stat__value--price">€{bike.pricePerDay}</span>
          </div>
          <div className="stat">
            <span className="stat__label">Deposit</span>
            <span className="stat__value">€{bike.deposit}</span>
          </div>
        </div>
        <button
          className="btn-rent"
          disabled={bike.isRented}
          onClick={() => onRent(bike)}
        >
          {bike.isRented ? 'Not available' : 'Rent'}
        </button>
      </div>
    </div>
  );
}