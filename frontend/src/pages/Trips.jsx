import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Set default base URL for Axios calls
const API_BASE = 'http://localhost:8080/api';

export default function Trips() {
  // Trips state
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
  const [revenue, setRevenue] = useState(''); // Optional bonus field

  // Modal / Complete Trip state
  const [activeTripForCompletion, setActiveTripForCompletion] = useState(null);
  const [actualDistance, setActualDistance] = useState('');
  const [fuelConsumed, setFuelConsumed] = useState('');

  // Notification state
  const [notification, setNotification] = useState(null); // { type: 'success' | 'danger', message: '' }

  // Show notification utility
  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Fetch initial data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [tripsRes, vehiclesRes, driversRes] = await Promise.all([
        axios.get(`${API_BASE}/trips`),
        axios.get(`${API_BASE}/vehicles/available`),
        axios.get(`${API_BASE}/drivers/available`),
      ]);

      if (tripsRes.data.success) setTrips(tripsRes.data.data);
      if (vehiclesRes.data.success) setVehicles(vehiclesRes.data.data);
      if (driversRes.data.success) setDrivers(driversRes.data.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      showNotification('danger', 'Failed to retrieve data from server. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Form submission: Create DRAFT trip
  const handleCreateTrip = async (e) => {
    e.preventDefault();

    if (!source || !destination || !vehicleId || !driverId || !cargoWeight || !plannedDistance) {
      showNotification('danger', 'Please fill in all required fields.');
      return;
    }

    try {
      const payload = {
        source,
        destination,
        vehicleId: parseInt(vehicleId),
        driverId: parseInt(driverId),
        cargoWeight: parseFloat(cargoWeight),
        plannedDistance: parseFloat(plannedDistance),
        revenue: revenue ? parseFloat(revenue) : null,
      };

      const res = await axios.post(`${API_BASE}/trips`, payload);

      if (res.data.success) {
        showNotification('success', 'Draft trip created successfully.');
        // Reset form
        setSource('');
        setDestination('');
        setVehicleId('');
        setDriverId('');
        setCargoWeight('');
        setPlannedDistance('');
        setRevenue('');
        // Refresh
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error occurred while creating the trip.';
      showNotification('danger', errMsg);
    }
  };

  // Action: Dispatch Trip
  const handleDispatchTrip = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/trips/${id}/dispatch`);
      if (res.data.success) {
        showNotification('success', 'Trip dispatched successfully! Vehicle and driver status updated to ON_TRIP.');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error dispatching trip.';
      showNotification('danger', errMsg);
    }
  };

  // Action: Cancel Trip
  const handleCancelTrip = async (id) => {
    try {
      const res = await axios.post(`${API_BASE}/trips/${id}/cancel`);
      if (res.data.success) {
        showNotification('success', 'Trip cancelled successfully. Vehicle and driver status restored to AVAILABLE.');
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error cancelling trip.';
      showNotification('danger', errMsg);
    }
  };

  // Action: Complete Trip Submission
  const handleCompleteSubmit = async (e) => {
    e.preventDefault();

    if (!actualDistance || !fuelConsumed) {
      showNotification('danger', 'Please enter actual odometer and fuel consumed values.');
      return;
    }

    try {
      const payload = {
        actualDistance: parseFloat(actualDistance),
        fuelConsumed: parseFloat(fuelConsumed),
      };

      const id = activeTripForCompletion.id;
      const res = await axios.post(`${API_BASE}/trips/${id}/complete`, payload);

      if (res.data.success) {
        showNotification('success', 'Trip completed successfully! Vehicle and driver status set back to AVAILABLE.');
        // Close modal & reset fields
        setActiveTripForCompletion(null);
        setActualDistance('');
        setFuelConsumed('');
        // Refresh
        fetchData();
      } else {
        showNotification('danger', res.data.message);
      }
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Error completing trip.';
      showNotification('danger', errMsg);
    }
  };

  return (
    <div className="trips-page">
      <header className="page-header" style={{ marginBottom: '32px' }}>
        <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700 }}>Trip Operations Management</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Plan, dispatch, and complete vehicle delivery lifecycles.</p>
      </header>

      {/* Alerts banner */}
      {notification && (
        <div className={`alert-banner alert-${notification.type}`} id="notification-banner">
          <span>{notification.message}</span>
        </div>
      )}

      <div className="dashboard-grid">
        {/* Create Trip Form Section */}
        <section className="card" aria-label="Create Trip Form">
          <h3 className="card-title">Create Delivery Trip</h3>
          <form onSubmit={handleCreateTrip}>
            <div className="form-group">
              <label htmlFor="source-input">Source Location *</label>
              <input
                id="source-input"
                type="text"
                className="form-control"
                placeholder="e.g. Warehouse A"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="destination-input">Destination Location *</label>
              <input
                id="destination-input"
                type="text"
                className="form-control"
                placeholder="e.g. Distribution Center B"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="vehicle-select">Available Vehicle *</label>
              <select
                id="vehicle-select"
                className="form-control"
                value={vehicleId}
                onChange={(e) => setVehicleId(e.target.value)}
                required
              >
                <option value="">Select an available vehicle...</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.registrationNumber} (Max: {v.maxLoadCapacity}kg)
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="driver-select">Available Driver *</label>
              <select
                id="driver-select"
                className="form-control"
                value={driverId}
                onChange={(e) => setDriverId(e.target.value)}
                required
              >
                <option value="">Select an available driver...</option>
                {drivers.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.licenseNumber})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="cargo-input">Cargo Weight (kg) *</label>
              <input
                id="cargo-input"
                type="number"
                step="any"
                className="form-control"
                placeholder="e.g. 450"
                value={cargoWeight}
                onChange={(e) => setCargoWeight(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="distance-input">Planned Distance (km) *</label>
              <input
                id="distance-input"
                type="number"
                step="any"
                className="form-control"
                placeholder="e.g. 120"
                value={plannedDistance}
                onChange={(e) => setPlannedDistance(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="revenue-input">Planned Revenue ($) (Optional)</label>
              <input
                id="revenue-input"
                type="number"
                step="any"
                className="form-control"
                placeholder="e.g. 1200"
                value={revenue}
                onChange={(e) => setRevenue(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '10px' }} id="btn-submit-trip">
              Create Trip
            </button>
          </form>
        </section>

        {/* Trip List Table Section */}
        <section className="card" style={{ overflow: 'hidden' }} aria-label="Trip List">
          <h3 className="card-title">Active Operational Trips</h3>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary)' }}>
              Loading operational logs...
            </div>
          ) : trips.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🚚</div>
              <p>No trips registered in database.</p>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Route</th>
                    <th>Vehicle ID</th>
                    <th>Driver ID</th>
                    <th>Cargo Weight</th>
                    <th>Planned Dist.</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {trips.map((t) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600, color: 'var(--text-secondary)' }}>#{t.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{t.source}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          to {t.destination}
                        </div>
                      </td>
                      <td>{t.vehicleId}</td>
                      <td>{t.driverId}</td>
                      <td>{t.cargoWeight} kg</td>
                      <td>{t.plannedDistance} km</td>
                      <td>
                        <span className={`badge badge-${t.status.toLowerCase()}`}>
                          {t.status}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          {t.status === 'DRAFT' && (
                            <button
                              id={`btn-dispatch-${t.id}`}
                              className="btn btn-primary btn-xs"
                              onClick={() => handleDispatchTrip(t.id)}
                            >
                              Dispatch
                            </button>
                          )}
                          {t.status === 'DISPATCHED' && (
                            <>
                              <button
                                id={`btn-complete-${t.id}`}
                                className="btn btn-success btn-xs"
                                onClick={() => setActiveTripForCompletion(t)}
                              >
                                Complete
                              </button>
                              <button
                                id={`btn-cancel-${t.id}`}
                                className="btn btn-danger btn-xs"
                                onClick={() => handleCancelTrip(t.id)}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          {(t.status === 'COMPLETED' || t.status === 'CANCELLED') && (
                            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>None</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Completion Details Modal */}
      {activeTripForCompletion && (
        <div className="modal-overlay" id="completion-modal">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Complete Trip #{activeTripForCompletion.id}</h3>
              <button className="modal-close" onClick={() => setActiveTripForCompletion(null)}>
                &times;
              </button>
            </div>
            <form onSubmit={handleCompleteSubmit}>
              <div className="form-group">
                <label htmlFor="actual-distance-input">Actual Distance (km) *</label>
                <input
                  id="actual-distance-input"
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 122.5"
                  value={actualDistance}
                  onChange={(e) => setActualDistance(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fuel-consumed-input">Fuel Consumed (liters) *</label>
                <input
                  id="fuel-consumed-input"
                  type="number"
                  step="any"
                  className="form-control"
                  placeholder="e.g. 15.2"
                  value={fuelConsumed}
                  onChange={(e) => setFuelConsumed(e.target.value)}
                  required
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setActiveTripForCompletion(null)}
                >
                  Close
                </button>
                <button type="submit" className="btn btn-success" id="btn-submit-completion">
                  Submit Completion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
