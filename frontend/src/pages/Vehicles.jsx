import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';

const VEHICLE_TYPES = ['Truck', 'Van', 'Bus', 'Car', 'Trailer', 'Tanker'];
const VEHICLE_STATUSES = ['AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'RETIRED'];

const initialForm = {
  registrationNumber: '',
  name: '',
  type: 'Truck',
  maxLoadCapacity: '',
  odometer: '',
  acquisitionCost: '',
  status: 'AVAILABLE',
};

const Vehicles = () => {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchVehicles = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/vehicles');
      setVehicles(res.data.data || []);
    } catch (err) {
      setError('Failed to load vehicles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const openCreate = () => {
    setForm(initialForm);
    setEditing(null);
    setError('');
    setModalOpen(true);
  };

  const openEdit = (vehicle) => {
    setForm({
      registrationNumber: vehicle.registrationNumber,
      name: vehicle.name,
      type: vehicle.type,
      maxLoadCapacity: vehicle.maxLoadCapacity,
      odometer: vehicle.odometer,
      acquisitionCost: vehicle.acquisitionCost,
      status: vehicle.status,
    });
    setEditing(vehicle.id);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await axiosInstance.put(`/vehicles/${editing}`, form);
        setSuccessMsg('Vehicle updated successfully');
      } else {
        await axiosInstance.post('/vehicles', form);
        setSuccessMsg('Vehicle created successfully');
      }
      setModalOpen(false);
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this vehicle?')) return;
    try {
      await axiosInstance.delete(`/vehicles/${id}`);
      setSuccessMsg('Vehicle deleted successfully');
      fetchVehicles();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusClass = (status) => {
    const map = { AVAILABLE: 'badge-success', ON_TRIP: 'badge-info', IN_SHOP: 'badge-warning', RETIRED: 'badge-danger' };
    return `badge ${map[status] || ''}`;
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Vehicles</h1>
            <p className="page-subtitle">Manage your fleet vehicles</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Vehicle</button>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && !modalOpen && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : vehicles.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">🚗</span>
            <h3>No vehicles yet</h3>
            <p>Add your first vehicle to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reg. Number</th>
                  <th>Name</th>
                  <th>Type</th>
                  <th>Max Load (kg)</th>
                  <th>Odometer (km)</th>
                  <th>Cost</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {vehicles.map((v) => (
                  <tr key={v.id}>
                    <td className="font-mono">{v.registrationNumber}</td>
                    <td>{v.name}</td>
                    <td>{v.type}</td>
                    <td>{v.maxLoadCapacity?.toLocaleString()}</td>
                    <td>{v.odometer?.toLocaleString()}</td>
                    <td>${v.acquisitionCost?.toLocaleString()}</td>
                    <td><span className={getStatusClass(v.status)}>{v.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(v)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(v.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
          {error && modalOpen && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Registration Number</label>
                <input value={form.registrationNumber} onChange={(e) => setForm({...form, registrationNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Vehicle Name</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Type</label>
                <select value={form.type} onChange={(e) => setForm({...form, type: e.target.value})}>
                  {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Max Load Capacity (kg)</label>
                <input type="number" step="0.01" value={form.maxLoadCapacity} onChange={(e) => setForm({...form, maxLoadCapacity: parseFloat(e.target.value) || ''})} required />
              </div>
              <div className="form-group">
                <label>Odometer (km)</label>
                <input type="number" step="0.01" value={form.odometer} onChange={(e) => setForm({...form, odometer: parseFloat(e.target.value) || ''})} required />
              </div>
              <div className="form-group">
                <label>Acquisition Cost ($)</label>
                <input type="number" step="0.01" value={form.acquisitionCost} onChange={(e) => setForm({...form, acquisitionCost: parseFloat(e.target.value) || ''})} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  {VEHICLE_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                </select>
              </div>
            </div>
            <div className="form-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
            </div>
          </form>
        </Modal>
      </main>
    </div>
  );
};

export default Vehicles;
