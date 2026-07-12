import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';

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

  const isLicenseExpired = (date) => new Date(date) < new Date();

  const getSafetyColor = (score) => {
    if (score >= 80) return '#34d399';
    if (score >= 60) return '#fbbf24';
    return '#f87171';
  };

  const renderBadge = (status) => {
    const colors = {
      AVAILABLE: { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      ON_TRIP: { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
      OFF_DUTY: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
      SUSPENDED: { bg: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', border: 'rgba(239,68,68,0.3)' },
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

  const tableHeaders = ['Name', 'License No.', 'Category', 'Expiry', 'Contact', 'Safety', 'Status', 'Actions'];
  const renderRow = (d) => {
    const safetyColor = getSafetyColor(d.safetyScore);
    const expired = isLicenseExpired(d.licenseExpiryDate);
    
    return (
      <>
        <td style={{ padding: '1rem', fontWeight: 600 }}>{d.name}</td>
        <td style={{ padding: '1rem', fontFamily: 'monospace', color: 'var(--color-info)' }}>{d.licenseNumber}</td>
        <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{d.licenseCategory}</td>
        <td style={{ padding: '1rem', color: expired ? '#fca5a5' : 'inherit' }}>
          {d.licenseExpiryDate} {expired && '⚠️'}
        </td>
        <td style={{ padding: '1rem' }}>{d.contactNumber}</td>
        <td style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '60px', height: '6px', background: 'rgba(148,163,184,0.2)', borderRadius: '3px', overflow: 'hidden' }}>
              <div style={{ width: `${d.safetyScore}%`, height: '100%', background: safetyColor }} />
            </div>
            <span style={{ fontSize: '0.85rem', color: safetyColor, fontWeight: 600 }}>{d.safetyScore}</span>
          </div>
        </td>
        <td style={{ padding: '1rem' }}>{renderBadge(d.status)}</td>
        <td style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={(e) => { e.stopPropagation(); openEdit(d); }}
              style={{
                background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)',
                border: '1px solid rgba(99,102,241,0.2)', padding: '0.4rem 0.8rem',
                borderRadius: '6px', fontSize: '0.85rem'
              }}
            >
              Edit
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); handleDelete(d.id); }}
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
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 className="page-title">Drivers</h1>
          <p className="page-subtitle">Manage your fleet drivers</p>
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
          + Add Driver
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
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading drivers...</div>
        ) : (
          <ModernTable headers={tableHeaders} data={drivers} renderRow={renderRow} emptyMessage="No drivers found. Add your first driver to get started." />
        )}
      </GlassCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Driver' : 'Add Driver'}>
        {error && modalOpen && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label>License Number</label>
              <input value={form.licenseNumber} onChange={(e) => setForm({ ...form, licenseNumber: e.target.value })} required />
            </div>
            <div>
              <label>License Category</label>
              <select value={form.licenseCategory} onChange={(e) => setForm({ ...form, licenseCategory: e.target.value })}>
                {LICENSE_CATEGORIES.map(c => <option key={c} value={c} style={{ background: 'var(--bg-main)' }}>{c}</option>)}
              </select>
            </div>
            <div>
              <label>License Expiry Date</label>
              <input type="date" value={form.licenseExpiryDate} onChange={(e) => setForm({ ...form, licenseExpiryDate: e.target.value })} required />
            </div>
            <div>
              <label>Contact Number</label>
              <input value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} required />
            </div>
            <div>
              <label>Safety Score (0-100)</label>
              <input type="number" step="0.1" min="0" max="100" value={form.safetyScore} onChange={(e) => setForm({ ...form, safetyScore: parseFloat(e.target.value) || '' })} required />
            </div>
            <div style={{ gridColumn: 'span 2' }}>
              <label>Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {DRIVER_STATUSES.map(s => <option key={s} value={s} style={{ background: 'var(--bg-main)' }}>{s.replace('_', ' ')}</option>)}
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

export default Drivers;
