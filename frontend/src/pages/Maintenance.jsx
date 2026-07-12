import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function Maintenance() {
    const [records, setRecords] = useState([]);
    const [form, setForm] = useState({ vehicleId: '', type: '', description: '', cost: '' });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

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
        setMessage('');
        try {
            const payload = {
                vehicleId: Number(form.vehicleId),
                type: form.type,
                description: form.description,
                cost: form.cost ? Number(form.cost) : null,
            };
            await axiosInstance.post('/maintenance', payload);
            setMessage('Maintenance record created — vehicle set to IN_SHOP');
            setForm({ vehicleId: '', type: '', description: '', cost: '' });
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error creating record');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = async (id) => {
        try {
            await axiosInstance.put(`/maintenance/${id}/close`);
            setMessage('Maintenance record closed');
            fetchRecords();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error closing record');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>🔧 Maintenance Management</h1>
                <p className="subtitle">Track vehicle maintenance and repair logs</p>
            </div>

            {message && <div className="alert">{message}</div>}

            <div className="card">
                <h2>New Maintenance Record</h2>
                <form onSubmit={handleSubmit} className="form-grid">
                    <div className="form-group">
                        <label htmlFor="vehicleId">Vehicle ID</label>
                        <input
                            id="vehicleId"
                            name="vehicleId"
                            type="number"
                            placeholder="e.g. 1"
                            value={form.vehicleId}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="type">Type</label>
                        <input
                            id="type"
                            name="type"
                            type="text"
                            placeholder="e.g. Oil Change, Brake Repair"
                            value={form.type}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="description">Description</label>
                        <input
                            id="description"
                            name="description"
                            type="text"
                            placeholder="Details about the maintenance"
                            value={form.description}
                            onChange={handleChange}
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="cost">Cost (₹)</label>
                        <input
                            id="cost"
                            name="cost"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={form.cost}
                            onChange={handleChange}
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Creating...' : '+ Create Record'}
                    </button>
                </form>
            </div>

            <div className="card">
                <h2>Maintenance Records</h2>
                {records.length === 0 ? (
                    <p className="empty-state">No maintenance records found.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle ID</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Cost</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Closed</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {records.map((r) => (
                                    <tr key={r.id}>
                                        <td>{r.id}</td>
                                        <td>{r.vehicleId}</td>
                                        <td>{r.type}</td>
                                        <td>{r.description || '—'}</td>
                                        <td>{r.cost != null ? `₹${r.cost.toFixed(2)}` : '—'}</td>
                                        <td>
                                            <span className={`badge ${r.status === 'OPEN' ? 'badge-warning' : 'badge-success'}`}>
                                                {r.status}
                                            </span>
                                        </td>
                                        <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                                        <td>{r.closedAt ? new Date(r.closedAt).toLocaleDateString() : '—'}</td>
                                        <td>
                                            {r.status === 'OPEN' && (
                                                <button className="btn btn-sm btn-success" onClick={() => handleClose(r.id)}>
                                                    Close
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
