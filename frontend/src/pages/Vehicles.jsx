import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';

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

    // Validation
    if (!form.registrationNumber.trim()) {
      setError('Registration number is required.');
      return;
    }
    if (form.maxLoadCapacity <= 0) {
      setError('Max Load Capacity must be greater than 0.');
      return;
    }
    if (form.acquisitionCost <= 0) {
      setError('Acquisition Cost must be greater than 0.');
      return;
    }

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

  const renderBadge = (status) => {
    const colors = {
      AVAILABLE: { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      ON_TRIP: { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
      IN_SHOP: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
      RETIRED: { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
    };
    const style = colors[status] || colors.AVAILABLE;
    return (
      <span style={{
        background: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em'
      }}>
        {status.replace('_', ' ')}
      </span>
    );
  };

  const tableHeaders = ['Reg. Number', 'Name', 'Type', 'Max Load', 'Odometer', 'Cost', 'Status', 'Actions'];
  const renderRow = (v) => (
    <>
      <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--color-info)' }}>{v.registrationNumber}</td>
      <td style={{ padding: '1rem', fontWeight: 500 }}>{v.name}</td>
      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{v.type}</td>
      <td style={{ padding: '1rem' }}>{v.maxLoadCapacity?.toLocaleString('en-IN')} kg</td>
      <td style={{ padding: '1rem' }}>{v.odometer?.toLocaleString('en-IN')} km</td>
      <td style={{ padding: '1rem', color: 'var(--color-success)' }}>₹{v.acquisitionCost?.toLocaleString('en-IN')}</td>
      <td style={{ padding: '1rem' }}>{renderBadge(v.status)}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(v); }}
            style={{
              background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)',
              border: '1px solid rgba(99,102,241,0.2)', padding: '0.4rem 0.8rem',
              borderRadius: '6px', fontSize: '0.85rem'
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(v.id); }}
            style={{
              background: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-danger)',
              border: '1px solid rgba(239,68,68,0.2)', padding: '0.4rem 0.8rem',
              borderRadius: '6px', fontSize: '0.85rem'
            }}
          >
            Delete
          </button>
        </div>
      </td>
    </>
  );

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Vehicles</h1>
          <p className="page-subtitle">Manage your fleet vehicles</p>
        </div>
        <button
          onClick={openCreate}
          style={{
            background: 'var(--bg-gradient-primary)',
            color: '#fff',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            fontWeight: 600,
            boxShadow: 'var(--shadow-glow-primary)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          + Add Vehicle
        </button>
      </div>

      {successMsg && (
        <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(16,185,129,0.2)' }}>
          {successMsg}
        </div>
      )}
      {error && !modalOpen && (
        <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
          {error}
        </div>
      )}

      <GlassCard>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading vehicles...</div>
        ) : (
          <ModernTable headers={tableHeaders} data={vehicles} renderRow={renderRow} emptyMessage="No vehicles found. Add your first vehicle to get started." />
        )}
      </GlassCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Vehicle' : 'Add Vehicle'}>
        {error && modalOpen && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label>Registration Number</label>
              <input value={form.registrationNumber} onChange={(e) => setForm({ ...form, registrationNumber: e.target.value })} required />
            </div>
            <div>
              <label>Vehicle Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label>Type</label>
              <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                {VEHICLE_TYPES.map(t => <option key={t} value={t} style={{ background: 'var(--bg-main)' }}>{t}</option>)}
              </select>
            </div>
            <div>
              <label>Max Load Capacity (kg)</label>
              <input type="number" step="0.01" value={form.maxLoadCapacity} onChange={(e) => setForm({ ...form, maxLoadCapacity: parseFloat(e.target.value) || '' })} required />
            </div>
            <div>
              <label>Odometer (km)</label>
              <input type="number" step="0.01" value={form.odometer} onChange={(e) => setForm({ ...form, odometer: parseFloat(e.target.value) || '' })} required />
            </div>
            <div>
              <label>Acquisition Cost (₹)</label>
              <input type="number" step="0.01" value={form.acquisitionCost} onChange={(e) => setForm({ ...form, acquisitionCost: parseFloat(e.target.value) || '' })} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {VEHICLE_STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--bg-main)' }}>{s.replace('_', ' ')}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="button" onClick={() => setModalOpen(false)} style={{ background: 'transparent', border: '1px solid var(--border-input)', color: 'var(--text-main)', padding: '0.75rem 1.5rem', borderRadius: '8px' }}>
              Cancel
            </button>
            <button type="submit" style={{ background: 'var(--bg-gradient-primary)', border: 'none', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-glow-primary)' }}>
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Vehicles;
