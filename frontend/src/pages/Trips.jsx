import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';
import Modal from '../components/Modal';

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [vehicleId, setVehicleId] = useState('');
  const [driverId, setDriverId] = useState('');
  const [cargoWeight, setCargoWeight] = useState('');
  const [plannedDistance, setPlannedDistance] = useState('');
  const [revenue, setRevenue] = useState('');

  // Modal / Complete Trip state
  const [activeTripForCompletion, setActiveTripForCompletion] = useState(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  // Notification state
  const [notification, setNotification] = useState(null);

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        axiosInstance.get('/trips'),
        axiosInstance.get('/vehicles/available'),
        axiosInstance.get('/drivers/available'),
      ]);

      if (tripsRes.data.success) setTrips(tripsRes.data.data);
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
      if (driversRes.data.success) setDrivers(driversRes.data.data);
    } catch (err) {
      showNotification('danger', 'Failed to retrieve data from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      showNotification('warning', 'Please fill in all required fields.');
      return;
    }

    if (cargoWeight <= 0 || plannedDistance <= 0) {
      showNotification('warning', 'Cargo weight and planned distance must be greater than zero.');
      return;
    }
    if (revenue && parseFloat(revenue) < 0) {
      showNotification('warning', 'Revenue cannot be negative.');
      return;
    }

    try {
      const payload = {
        source, destination,
        vehicleId: parseInt(vehicleId), driverId: parseInt(driverId),
        cargoWeight: parseFloat(cargoWeight), plannedDistance: parseFloat(plannedDistance),
        revenue: revenue ? parseFloat(revenue) : null,
      };
      const res = await axiosInstance.post('/trips', payload);
      if (res.data.success) {
        showNotification('success', 'Draft trip created successfully.');
        setSource(''); setDestination(''); setVehicleId(''); setDriverId('');
        setCargoWeight(''); setPlannedDistance(''); setRevenue('');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Error creating trip.');
    }
  };

  const handleDispatchTrip = async (id) => {
    try {
      const res = await axiosInstance.post(`/trips/${id}/dispatch`);
      if (res.data.success) {
        showNotification('success', 'Trip dispatched successfully!');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Error dispatching trip.');
    }
  };

  const handleCancelTrip = async (id) => {
    try {
      const res = await axiosInstance.post(`/trips/${id}/cancel`);
      if (res.data.success) {
        showNotification('info', 'Trip cancelled.');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Error cancelling trip.');
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!actualDistance || !fuelConsumed) {
      showNotification('warning', 'Please enter actual odometer and fuel consumed values.');
      return;
    }

    if (actualDistance <= 0 || fuelConsumed <= 0) {
      showNotification('warning', 'Distance and fuel consumed must be greater than zero.');
      return;
    }

    try {
      const payload = { actualDistance: parseFloat(actualDistance), fuelConsumed: parseFloat(fuelConsumed) };
      const res = await axiosInstance.post(`/trips/${activeTripForCompletion.id}/complete`, payload);
      if (res.data.success) {
        showNotification('success', 'Trip completed successfully!');
        setActiveTripForCompletion(null);
        setActualDistance(''); setFuelConsumed('');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      showNotification('danger', err.response?.data?.message || 'Error completing trip.');
    }
  };

  const renderBadge = (status) => {
    const colors = {
      DRAFT: { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
      DISPATCHED: { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
      COMPLETED: { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      CANCELLED: { bg: 'rgba(239, 68, 68, 0.2)', color: '#f87171', border: 'rgba(239,68,68,0.3)' },
    };
    const style = colors[status] || colors.DRAFT;
    return (
      <span style={{
        background: style.bg, color: style.color, border: `1px solid ${style.border}`,
        padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.05em'
      }}>
        {status}
      </span>
    );
  };

  const tableHeaders = ['ID', 'Route', 'Vehicle', 'Driver', 'Cargo', 'Dist.', 'Status', 'Actions'];
  const renderRow = (t) => (
    <>
      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{t.id}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{ fontWeight: 500 }}>{t.source}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>to {t.destination}</div>
      </td>
      <td style={{ padding: '1rem', color: 'var(--color-info)' }}>ID: {t.vehicleId}</td>
      <td style={{ padding: '1rem', color: 'var(--color-secondary)' }}>ID: {t.driverId}</td>
      <td style={{ padding: '1rem' }}>{t.cargoWeight} kg</td>
      <td style={{ padding: '1rem' }}>{t.plannedDistance} km</td>
      <td style={{ padding: '1rem' }}>{renderBadge(t.status)}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {t.status === 'DRAFT' && (
            <button
              onClick={() => handleDispatchTrip(t.id)}
              style={{
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)',
                border: '1px solid rgba(99,102,241,0.2)', padding: '0.3rem 0.6rem',
                borderRadius: '6px', fontSize: '0.8rem'
              }}
            >
              Dispatch
            </button>
          )}
          {t.status === 'DISPATCHED' && (
            <>
              <button
                onClick={() => setActiveTripForCompletion(t)}
                style={{
                  background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)',
                  border: '1px solid rgba(16,185,129,0.2)', padding: '0.3rem 0.6rem',
                  borderRadius: '6px', fontSize: '0.8rem'
                }}
              >
                Complete
              </button>
              <button
                onClick={() => handleCancelTrip(t.id)}
                style={{
                  background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)',
                  border: '1px solid rgba(239,68,68,0.2)', padding: '0.3rem 0.6rem',
                  borderRadius: '6px', fontSize: '0.8rem'
                }}
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </td>
    </>
  );

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 className="page-title">Trip Operations</h1>
        <p className="page-subtitle">Plan, dispatch, and complete vehicle delivery lifecycles.</p>
      </div>

      {notification && (
        <div style={{
          background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : notification.type === 'warning' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
          color: notification.type === 'success' ? '#34d399' : notification.type === 'warning' ? '#fbbf24' : '#fca5a5',
          padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
          border: `1px solid ${notification.type === 'success' ? 'rgba(16,185,129,0.2)' : notification.type === 'warning' ? 'rgba(245,158,11,0.2)' : 'rgba(239,68,68,0.2)'}`
        }}>
          {notification.message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
        <GlassCard title="Create Delivery Trip">
          <form onSubmit={handleCreateTrip}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
              <div>
                <label>Source Location *</label>
                <input value={source} onChange={e => setSource(e.target.value)} placeholder="e.g. Warehouse A" required />
              </div>
              <div>
                <label>Destination Location *</label>
                <input value={destination} onChange={e => setDestination(e.target.value)} placeholder="e.g. Dist. Center B" required />
              </div>
              <div>
                <label>Available Vehicle *</label>
                <select value={vehicleId} onChange={e => setVehicleId(e.target.value)} required>
                  <option value="" style={{ background: 'var(--bg-main)' }}>Select a vehicle...</option>
                  {vehicles.map(v => <option key={v.id} value={v.id} style={{ background: 'var(--bg-main)' }}>{v.registrationNumber} (Max: {v.maxLoadCapacity}kg)</option>)}
                </select>
              </div>
              <div>
                <label>Available Driver *</label>
                <select value={driverId} onChange={e => setDriverId(e.target.value)} required>
                  <option value="" style={{ background: 'var(--bg-main)' }}>Select a driver...</option>
                  {drivers.map(d => <option key={d.id} value={d.id} style={{ background: 'var(--bg-main)' }}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label>Cargo Weight (kg) *</label>
                <input type="number" step="any" value={cargoWeight} onChange={e => setCargoWeight(e.target.value)} required />
              </div>
              <div>
                <label>Planned Distance (km) *</label>
                <input type="number" step="any" value={plannedDistance} onChange={e => setPlannedDistance(e.target.value)} required />
              </div>
              <div>
                <label>Planned Revenue (₹) (Optional)</label>
                <input type="number" step="any" value={revenue} onChange={e => setRevenue(e.target.value)} />
              </div>
            </div>
            <button
              type="submit"
              style={{
                width: '100%', background: 'var(--bg-gradient-primary)', border: 'none', color: '#fff',
                padding: '0.75rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-glow-primary)'
              }}
            >
              Create Trip
            </button>
          </form>
        </GlassCard>

        <GlassCard title="Active Operational Trips">
          {loading ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading operational logs...</div>
          ) : (
            <ModernTable headers={tableHeaders} data={trips} renderRow={renderRow} emptyMessage="No trips registered in database." />
          )}
        </GlassCard>
      </div>

      <Modal isOpen={!!activeTripForCompletion} onClose={() => setActiveTripForCompletion(null)} title={`Complete Trip #${activeTripForCompletion?.id}`}>
        <form onSubmit={handleCompleteSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label>Actual Distance (km) *</label>
              <input type="number" step="any" value={actualDistance} onChange={e => setActualDistance(e.target.value)} required />
            </div>
            <div>
              <label>Fuel Consumed (liters) *</label>
              <input type="number" step="any" value={fuelConsumed} onChange={e => setFuelConsumed(e.target.value)} required />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => setActiveTripForCompletion(null)} style={{ background: 'transparent', border: '1px solid var(--border-input)', color: 'var(--text-main)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
              Close
            </button>
            <button type="submit" style={{ background: 'rgba(16, 185, 129, 0.2)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600 }}>
              Submit Completion
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
