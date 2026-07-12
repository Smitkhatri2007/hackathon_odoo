import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import Navbar from '../components/Navbar';

const LICENSE_CATEGORIES = ['A', 'B', 'C', 'D', 'E', 'CE', 'DE'];
const DRIVER_STATUSES = ['AVAILABLE', 'ON_TRIP', 'OFF_DUTY', 'SUSPENDED'];

const initialForm = {
  name: '',
  licenseNumber: '',
  licenseCategory: 'B',
  licenseExpiryDate: '',
  contactNumber: '',
  safetyScore: '',
  status: 'AVAILABLE',
};

const Drivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchDrivers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/drivers');
      setDrivers(res.data.data || []);
    } catch (err) {
      setError('Failed to load drivers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDrivers();
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

  const openEdit = (driver) => {
    setForm({
      name: driver.name,
      licenseNumber: driver.licenseNumber,
      licenseCategory: driver.licenseCategory,
      licenseExpiryDate: driver.licenseExpiryDate,
      contactNumber: driver.contactNumber,
      safetyScore: driver.safetyScore,
      status: driver.status,
    });
    setEditing(driver.id);
    setError('');
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await axiosInstance.put(`/drivers/${editing}`, form);
        setSuccessMsg('Driver updated successfully');
      } else {
        await axiosInstance.post('/drivers', form);
        setSuccessMsg('Driver created successfully');
      }
      setModalOpen(false);
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this driver?')) return;
    try {
      await axiosInstance.delete(`/drivers/${id}`);
      setSuccessMsg('Driver deleted successfully');
      fetchDrivers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const getStatusClass = (status) => {
    const map = { AVAILABLE: 'badge-success', ON_TRIP: 'badge-info', OFF_DUTY: 'badge-warning', SUSPENDED: 'badge-danger' };
    return `badge ${map[status] || ''}`;
  };

  const isLicenseExpired = (date) => new Date(date) < new Date();

  const getSafetyColor = (score) => {
    if (score >= 80) return 'var(--color-success)';
    if (score >= 60) return 'var(--color-warning)';
    return 'var(--color-danger)';
  };

  return (
    <div className="page-wrapper">
      <Navbar />
      <main className="main-content">
        <div className="page-header">
          <div>
            <h1>Drivers</h1>
            <p className="page-subtitle">Manage your fleet drivers</p>
          </div>
          <button className="btn btn-primary" onClick={openCreate}>+ Add Driver</button>
        </div>

        {successMsg && <div className="alert alert-success">{successMsg}</div>}
        {error && !modalOpen && <div className="alert alert-error">{error}</div>}

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : drivers.length === 0 ? (
          <div className="empty-state">
            <span className="empty-icon">👤</span>
            <h3>No drivers yet</h3>
            <p>Add your first driver to get started</p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>License No.</th>
                  <th>Category</th>
                  <th>License Expiry</th>
                  <th>Contact</th>
                  <th>Safety Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {drivers.map((d) => (
                  <tr key={d.id}>
                    <td className="font-semibold">{d.name}</td>
                    <td className="font-mono">{d.licenseNumber}</td>
                    <td>{d.licenseCategory}</td>
                    <td>
                      <span className={isLicenseExpired(d.licenseExpiryDate) ? 'text-danger' : ''}>
                        {d.licenseExpiryDate}
                        {isLicenseExpired(d.licenseExpiryDate) && ' ⚠️'}
                      </span>
                    </td>
                    <td>{d.contactNumber}</td>
                    <td>
                      <div className="safety-score">
                        <div className="score-bar">
                          <div className="score-fill" style={{ width: `${d.safetyScore}%`, backgroundColor: getSafetyColor(d.safetyScore) }}></div>
                        </div>
                        <span className="score-value">{d.safetyScore}</span>
                      </div>
                    </td>
                    <td><span className={getStatusClass(d.status)}>{d.status.replace('_', ' ')}</span></td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn btn-sm btn-ghost" onClick={() => openEdit(d)}>Edit</button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(d.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
          {error && modalOpen && <div className="alert alert-error">{error}</div>}
          <form onSubmit={handleSubmit}>
            <div className="form-grid">
              <div className="form-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>License Number</label>
                <input value={form.licenseNumber} onChange={(e) => setForm({...form, licenseNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>License Category</label>
                <select value={form.licenseCategory} onChange={(e) => setForm({...form, licenseCategory: e.target.value})}>
                  {LICENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>License Expiry Date</label>
                <input type="date" value={form.licenseExpiryDate} onChange={(e) => setForm({...form, licenseExpiryDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input value={form.contactNumber} onChange={(e) => setForm({...form, contactNumber: e.target.value})} required />
              </div>
              <div className="form-group">
                <label>Safety Score (0-100)</label>
                <input type="number" step="0.1" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({...form, safetyScore: parseFloat(e.target.value) || ''})} required />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={form.status} onChange={(e) => setForm({...form, status: e.target.value})}>
                  {DRIVER_STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
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

export default Drivers;
