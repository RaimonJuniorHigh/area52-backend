import { useState } from 'react';
import { Bike, calculateTotalPrice } from '../models/Bike';
import { canRent, GuestValidator } from '../validations/age';

interface Props {
  bike: Bike;
  onConfirm: (bike: Bike, days: number) => void;
  onClose: () => void;
}

export default function RentModal({ bike, onConfirm, onClose }: Props) {
  const [days, setDays] = useState(3);
  const [age, setAge] = useState<number | ''>('');
  const [error, setError] = useState<string | null>(null);

  function handleConfirm() {
    if (age === '') {
      setError('Please enter your age.');
      return;
    }

    const guest: GuestValidator = { name: '', age: Number(age) };

    if (!canRent(guest)) {
      setError('You must be at least 18 years old to rent a bike.');
      return;
    }

    setError(null);
    onConfirm(bike, days);
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <button className="modal__close" onClick={onClose}>×</button>
        <span className="modal__type">{bike.type}</span>
        <h2 className="modal__name">{bike.name}</h2>

        <div className="modal__grid">
          <div className="modal__stat">
            <span className="modal__stat-label">Price per day</span>
            <span className="modal__stat-value modal__stat-value--big">€{bike.pricePerDay}</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-label">Deposit</span>
            <span className="modal__stat-value">€{bike.deposit}</span>
          </div>
          <div className="modal__stat">
            <span className="modal__stat-label">Min. age</span>
            <span className="modal__stat-value">18 years</span>
          </div>
        </div>

        <div className="modal__days">
          <label>Number of days</label>
          <input
            type="range"
            min={1}
            max={30}
            value={days}
            onChange={e => setDays(Number(e.target.value))}
          />
          <div className="modal__days-display">
            <span className="modal__days-num">{days} days</span>
            <span className="modal__total">€{calculateTotalPrice(bike, days)}</span>
          </div>
        </div>

        <div className="modal__age">
          <label>Your age</label>
          <input
            type="number"
            min={0}
            max={120}
            value={age}
            onChange={e => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            placeholder="Enter your age"
          />
        </div>

        {error && <p className="modal__error">{error}</p>}

        <button className="btn-confirm" onClick={handleConfirm}>
          Confirm rental
        </button>
      </div>
    </div>
  );
}