import { useState } from 'react';
import { Bike, bikes as initialBikes } from './models/Bike';
import BikeCard from './components/BikeCard';
import RentModal from './components/RentModal';
import { createRentalLog } from './models/rentalLog';

type Filter = 'all' | 'bike' | 'electric bike' | 'racebike' | 'mountainbike';

const filters: { label: string; value: Filter }[] = [
  { label: 'All',          value: 'all' },
  { label: 'Bike',         value: 'bike' },
  { label: 'Electric',     value: 'electric bike' },
  { label: 'Racebike',     value: 'racebike' },
  { label: 'Mountainbike', value: 'mountainbike' },
];

export default function App() {
  const [bikes, setBikes] = useState<Bike[]>(initialBikes);
  const [activeFilter, setActiveFilter] = useState<Filter>('all');
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const filtered = activeFilter === 'all'
    ? bikes
    : bikes.filter(b => b.type === activeFilter);

  const available = bikes.filter(b => !b.isRented).length;
  const rented = bikes.filter(b => b.isRented).length;
  const cheapest = Math.min(...bikes.map(b => b.pricePerDay));

  function handleConfirm(bike: Bike, days: number) {
    setBikes(prev =>
      prev.map(b => b.id === bike.id ? { ...b, isRented: true } : b)
    );
    
    const rental = createRentalLog(bike, 1, days); // guestId tijdelijk hardcoded op 1
    
    setSelectedBike(null);
    showToast(`✓ ${bike.name} booked for ${days} days — €${bike.pricePerDay * days}`);
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  }

  return (
    <>
      <header className="header">
        <div className="logo">Area<span>52</span></div>
        <div className="hero-meta">
          <p>Bike Rental</p>
          <strong>{available} bikes available</strong>
        </div>
      </header>

      <div className="marquee-wrap">
        <div className="marquee">
          {[...bikes, ...bikes].map((b, i) => (
            <span key={i}>{b.name} <em>·</em> </span>
          ))}
        </div>
      </div>

      <div className="stats-bar">
        <div className="stat-item"><span className="num">{bikes.length}</span><span className="lbl">Bikes total</span></div>
        <div className="stat-item"><span className="num">{available}</span><span className="lbl">Available</span></div>
        <div className="stat-item"><span className="num">{rented}</span><span className="lbl">Rented</span></div>
        <div className="stat-item"><span className="num">€{cheapest}</span><span className="lbl">From per day</span></div>
      </div>

      <div className="filters">
        <span className="filter-label">Filter:</span>
        {filters.map(f => (
          <button
            key={f.value}
            className={`filter-btn ${activeFilter === f.value ? 'active' : ''}`}
            onClick={() => setActiveFilter(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid">
        {filtered.length === 0
          ? <div className="empty">No bikes found</div>
          : filtered.map(b => (
              <BikeCard key={b.id} bike={b} onRent={setSelectedBike} />
            ))
        }
      </div>

      {selectedBike && (
        <RentModal
          bike={selectedBike}
          onConfirm={handleConfirm}
          onClose={() => setSelectedBike(null)}
        />
      )}

      {toast && <div className="toast show">{toast}</div>}
    </>
  );
}