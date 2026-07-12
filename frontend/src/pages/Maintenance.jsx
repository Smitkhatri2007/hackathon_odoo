import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';

export default function Maintenance() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ vehicleId: '', type: '', description: '', cost: '' });
    const [loading, setLoading] = useState(false);
    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchRecords = async () => {
        try {
            const res = await axiosInstance.get('/maintenance');
            setRecords(res.data.data || []);
        } catch (err) {
            console.error('Failed to fetch maintenance records', err);
        }
    };

    useEffect(() => { fetchRecords(); }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (form.cost && Number(form.cost) < 0) {
            showNotification('warning', 'Cost cannot be negative.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                vehicleId: Number(form.vehicleId),
                type: form.type,
                description: form.description,
                cost: form.cost ? Number(form.cost) : null,
            };
            await axiosInstance.post('/maintenance', payload);
            showNotification('success', 'Maintenance record created — vehicle set to IN_SHOP');
            setForm({ vehicleId: '', type: '', description: '', cost: '' });
            fetchRecords();
        } catch (err) {
            showNotification('danger', err.response?.data?.message || 'Error creating record');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await axiosInstance.put(`/maintenance/${id}/close`);
            showNotification('success', 'Maintenance record closed');
            fetchRecords();
        } catch (err) {
            showNotification('danger', err.response?.data?.message || 'Error closing record');
        }
    };

    const renderBadge = (status) => {
        const isClosed = status === 'CLOSED';
        return (
            <span style={{
                background: isClosed ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                color: isClosed ? '#34d399' : '#fbbf24',
                border: `1px solid ${isClosed ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
                padding: '0.25rem 0.75rem',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                letterSpacing: '0.05em'
            }}>
                {status}
            </span>
        );
    };

    const tableHeaders = ['ID', 'Vehicle ID', 'Type', 'Description', 'Cost', 'Status', 'Created', 'Closed', 'Action'];
    const renderRow = (r) => (
        <>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{r.id}</td>
            <td style={{ padding: '1rem', color: 'var(--color-info)' }}>{r.vehicleId}</td>
            <td style={{ padding: '1rem', fontWeight: 500 }}>{r.type}</td>
            <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>{r.description || '—'}</td>
            <td style={{ padding: '1rem', color: 'var(--color-success)' }}>{r.cost != null ? `₹${r.cost.toLocaleString('en-IN')}` : '—'}</td>
            <td style={{ padding: '1rem' }}>{renderBadge(r.status)}</td>
            <td style={{ padding: '1rem' }}>{new Date(r.createdAt).toLocaleDateString()}</td>
            <td style={{ padding: '1rem' }}>{r.closedAt ? new Date(r.closedAt).toLocaleDateString() : '—'}</td>
            <td style={{ padding: '1rem' }}>
                {r.status === 'OPEN' && (
                    <button
                        onClick={() => handleClose(r.id)}
                        style={{
                            background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)',
                            border: '1px solid rgba(16,185,129,0.2)', padding: '0.3rem 0.6rem',
                            borderRadius: '6px', fontSize: '0.8rem'
                        }}
                    >
                        Close
                    </button>
                )}
            </td>
        </>
    );

    return (
        <div className="page-container animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Maintenance</h1>
                <p className="page-subtitle">Track vehicle maintenance and repair logs</p>
            </div>

            {notification && (
                <div style={{
                    background: notification.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    color: notification.type === 'success' ? '#34d399' : '#fca5a5',
                    padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem',
                    border: `1px solid ${notification.type === 'success' ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)'}`
                }}>
                    {notification.message}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem', marginBottom: '2rem' }}>
                <GlassCard title="New Maintenance Record">
                    <form onSubmit={handleSubmit}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label>Vehicle ID</label>
                                <input name="vehicleId" type="number" placeholder="e.g. 1" value={form.vehicleId} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Type</label>
                                <input name="type" type="text" placeholder="e.g. Oil Change" value={form.type} onChange={handleChange} required />
                            </div>
                            <div>
                                <label>Description</label>
                                <input name="description" type="text" placeholder="Details about the maintenance" value={form.description} onChange={handleChange} />
                            </div>
                            <div>
                                <label>Cost (₹)</label>
                                <input name="cost" type="number" step="0.01" placeholder="0.00" value={form.cost} onChange={handleChange} />
                            </div>
                        </div>
                        <button type="submit" disabled={loading} style={{
                            width: '100%', background: 'var(--bg-gradient-primary)', border: 'none', color: '#fff',
                            padding: '0.75rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-glow-primary)',
                            opacity: loading ? 0.7 : 1
                        }}>
                            {loading ? 'Creating...' : '+ Create Record'}
                        </button>
                    </form>
                </GlassCard>

                <GlassCard title="Maintenance Records">
                    <ModernTable headers={tableHeaders} data={records} renderRow={renderRow} emptyMessage="No maintenance records found." />
                </GlassCard>
            </div>
        </div>
    );
}
