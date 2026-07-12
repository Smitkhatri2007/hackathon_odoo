import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';
import { exportToCSV } from '../utils/exportCsv';

export default function FuelExpense() {
    const [fuelLogs, setFuelLogs] = useState([]);
    const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', logDate: '' });

    const [expenses, setExpenses] = useState([]);
    const [expenseForm, setExpenseForm] = useState({ vehicleId: '', type: '', cost: '', logDate: '' });

    const [fuelSearchQuery, setFuelSearchQuery] = useState('');
    const [expenseSearchQuery, setExpenseSearchQuery] = useState('');
    const [expenseSearchCategory, setExpenseSearchCategory] = useState('all');

    const [notification, setNotification] = useState(null);

    const showNotification = (type, message) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 5000);
    };

    const fetchFuelLogs = async () => {
        try {
            const res = await axiosInstance.get('/fuel-logs');
            setFuelLogs(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    const fetchExpenses = async () => {
        try {
            const res = await axiosInstance.get('/expenses');
            setExpenses(res.data.data || []);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchFuelLogs(); fetchExpenses(); }, []);

    const handleFuelChange = (e) => setFuelForm({ ...fuelForm, [e.target.name]: e.target.value });
    const handleFuelSubmit = async (e) => {
        e.preventDefault();
        if (Number(fuelForm.liters) <= 0 || Number(fuelForm.cost) < 0) {
            showNotification('warning', 'Liters must be > 0 and cost cannot be negative.');
            return;
        }
        try {
            await axiosInstance.post('/fuel-logs', {
                vehicleId: Number(fuelForm.vehicleId),
                liters: Number(fuelForm.liters),
                cost: Number(fuelForm.cost),
                logDate: fuelForm.logDate,
            });
            showNotification('success', 'Fuel log created');
            setFuelForm({ vehicleId: '', liters: '', cost: '', logDate: '' });
            fetchFuelLogs();
        } catch (err) {
            showNotification('danger', err.response?.data?.message || 'Error creating fuel log');
        }
    };

    const handleExpenseChange = (e) => setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });
    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        if (Number(expenseForm.cost) < 0) {
            showNotification('warning', 'Cost cannot be negative.');
            return;
        }
        try {
            await axiosInstance.post('/expenses', {
                vehicleId: Number(expenseForm.vehicleId),
                type: expenseForm.type,
                cost: Number(expenseForm.cost),
                logDate: expenseForm.logDate,
            });
            showNotification('success', 'Expense created');
            setExpenseForm({ vehicleId: '', type: '', cost: '', logDate: '' });
            fetchExpenses();
        } catch (err) {
            showNotification('danger', err.response?.data?.message || 'Error creating expense');
        }
    };

    const fuelHeaders = ['ID', 'Vehicle ID', 'Liters', 'Cost', 'Date'];
    const fuelRow = (f) => (
        <>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{f.id}</td>
            <td style={{ padding: '1rem', color: 'var(--color-info)' }}>{f.vehicleId}</td>
            <td style={{ padding: '1rem' }}>{f.liters} L</td>
            <td style={{ padding: '1rem', color: 'var(--color-danger)' }}>₹{f.cost?.toLocaleString('en-IN')}</td>
            <td style={{ padding: '1rem' }}>{f.logDate}</td>
        </>
    );

    const expHeaders = ['ID', 'Vehicle ID', 'Type', 'Cost', 'Date'];
    const expRow = (ex) => (
        <>
            <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{ex.id}</td>
            <td style={{ padding: '1rem', color: 'var(--color-info)' }}>{ex.vehicleId}</td>
            <td style={{ padding: '1rem', fontWeight: 500 }}>{ex.type}</td>
            <td style={{ padding: '1rem', color: 'var(--color-danger)' }}>₹{ex.cost?.toLocaleString('en-IN')}</td>
            <td style={{ padding: '1rem' }}>{ex.logDate}</td>
        </>
    );

    const filteredFuelLogs = fuelLogs.filter(f => 
        String(f.vehicleId).includes(fuelSearchQuery)
    );

    const filteredExpenses = expenses.filter(ex => {
        const q = expenseSearchQuery.toLowerCase();
        if (expenseSearchCategory === 'vehicleId') return String(ex.vehicleId).includes(q);
        if (expenseSearchCategory === 'type') return ex.type && ex.type.toLowerCase().includes(q);
        return String(ex.vehicleId).includes(q) || (ex.type && ex.type.toLowerCase().includes(q));
    });

    return (
        <div className="page-container animate-fade-in">
            <div style={{ marginBottom: '2rem' }}>
                <h1 className="page-title">Fuel Logs & Expenses</h1>
                <p className="page-subtitle">Track fuel consumption and operational expenses</p>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
                <GlassCard title="New Fuel Log">
                    <form onSubmit={handleFuelSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label>Vehicle ID</label>
                                <input name="vehicleId" type="number" min="0" placeholder="e.g. 1" value={fuelForm.vehicleId} onChange={handleFuelChange} required />
                            </div>
                            <div>
                                <label>Liters</label>
                                <input name="liters" type="number" step="0.01" min="0" placeholder="0.00" value={fuelForm.liters} onChange={handleFuelChange} required />
                            </div>
                            <div>
                                <label>Cost (₹)</label>
                                <input name="cost" type="number" step="0.01" min="0" placeholder="0.00" value={fuelForm.cost} onChange={handleFuelChange} required />
                            </div>
                            <div>
                                <label>Date</label>
                                <input name="logDate" type="date" value={fuelForm.logDate} onChange={handleFuelChange} required />
                            </div>
                        </div>
                        <button type="submit" style={{ width: '100%', background: 'var(--bg-gradient-primary)', border: 'none', color: '#fff', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-glow-primary)' }}>
                            + Add Fuel Log
                        </button>
                    </form>
                </GlassCard>

                <GlassCard title="New Expense">
                    <form onSubmit={handleExpenseSubmit}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                            <div>
                                <label>Vehicle ID</label>
                                <input name="vehicleId" type="number" min="0" placeholder="e.g. 1" value={expenseForm.vehicleId} onChange={handleExpenseChange} required />
                            </div>
                            <div>
                                <label>Type</label>
                                <input name="type" type="text" placeholder="e.g. Toll, Parking" value={expenseForm.type} onChange={handleExpenseChange} required />
                            </div>
                            <div>
                                <label>Cost (₹)</label>
                                <input name="cost" type="number" step="0.01" min="0" placeholder="0.00" value={expenseForm.cost} onChange={handleExpenseChange} required />
                            </div>
                            <div>
                                <label>Date</label>
                                <input name="logDate" type="date" value={expenseForm.logDate} onChange={handleExpenseChange} required />
                            </div>
                        </div>
                        <button type="submit" style={{ width: '100%', background: 'var(--bg-gradient-primary)', border: 'none', color: '#fff', padding: '0.75rem', borderRadius: '8px', fontWeight: 600, boxShadow: 'var(--shadow-glow-primary)' }}>
                            + Add Expense
                        </button>
                    </form>
                </GlassCard>

                <GlassCard title="Fuel Log History">
                    <div style={{ marginBottom: '1.5rem' }}>
                        <input 
                            type="text" 
                            placeholder="Search by vehicle ID..." 
                            value={fuelSearchQuery}
                            onChange={(e) => setFuelSearchQuery(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                        <button 
                            onClick={() => exportToCSV(filteredFuelLogs, 'fuel_logs')}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontWeight: 600, cursor: 'pointer', marginLeft: '0.5rem' }}
                        >
                            ↓ Export CSV
                        </button>
                    </div>
                    <ModernTable headers={fuelHeaders} data={filteredFuelLogs} renderRow={fuelRow} emptyMessage="No fuel logs match your search." />
                </GlassCard>

                <GlassCard title="Expense History">
                    <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '0.5rem' }}>
                        <select 
                            value={expenseSearchCategory} 
                            onChange={(e) => setExpenseSearchCategory(e.target.value)}
                            style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-main)', width: '150px' }}
                        >
                            <option value="all">All</option>
                            <option value="vehicleId">Vehicle ID</option>
                            <option value="type">Type</option>
                        </select>
                        <input 
                            type="text" 
                            placeholder="Search expenses..." 
                            value={expenseSearchQuery}
                            onChange={(e) => setExpenseSearchQuery(e.target.value)}
                            style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-input)', background: 'var(--bg-input)', color: 'var(--text-main)' }}
                        />
                        <button 
                            onClick={() => exportToCSV(filteredExpenses, 'expenses')}
                            style={{ padding: '0.75rem 1.5rem', borderRadius: '8px', border: '1px solid var(--color-success)', background: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)', fontWeight: 600, cursor: 'pointer' }}
                        >
                            ↓ Export CSV
                        </button>
                    </div>
                    <ModernTable headers={expHeaders} data={filteredExpenses} renderRow={expRow} emptyMessage="No expenses match your search." />
                </GlassCard>
            </div>
        </div>
    );
}
