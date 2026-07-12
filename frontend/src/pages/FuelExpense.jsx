import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

export default function FuelExpense() {
    // ─── Fuel Log State ───
    const [fuelLogs, setFuelLogs] = useState([]);
    const [fuelForm, setFuelForm] = useState({ vehicleId: '', liters: '', cost: '', logDate: '' });

    // ─── Expense State ───
    const [expenses, setExpenses] = useState([]);
    const [expenseForm, setExpenseForm] = useState({ vehicleId: '', type: '', cost: '', logDate: '' });

    const [message, setMessage] = useState('');

    // ─── Fetch ───
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

    // ─── Fuel Log Handlers ───
    const handleFuelChange = (e) => setFuelForm({ ...fuelForm, [e.target.name]: e.target.value });

    const handleFuelSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axiosInstance.post('/fuel-logs', {
                vehicleId: Number(fuelForm.vehicleId),
                liters: Number(fuelForm.liters),
                cost: Number(fuelForm.cost),
                logDate: fuelForm.logDate,
            });
            setMessage('Fuel log created');
            setFuelForm({ vehicleId: '', liters: '', cost: '', logDate: '' });
            fetchFuelLogs();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error creating fuel log');
        }
    };

    // ─── Expense Handlers ───
    const handleExpenseChange = (e) => setExpenseForm({ ...expenseForm, [e.target.name]: e.target.value });

    const handleExpenseSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        try {
            await axiosInstance.post('/expenses', {
                vehicleId: Number(expenseForm.vehicleId),
                type: expenseForm.type,
                cost: Number(expenseForm.cost),
                logDate: expenseForm.logDate,
            });
            setMessage('Expense created');
            setExpenseForm({ vehicleId: '', type: '', cost: '', logDate: '' });
            fetchExpenses();
        } catch (err) {
            setMessage(err.response?.data?.message || 'Error creating expense');
        }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <h1>⛽ Fuel Logs & Expenses</h1>
                <p className="subtitle">Track fuel consumption and operational expenses</p>
            </div>

            {message && <div className="alert">{message}</div>}

            {/* ─────── FUEL LOGS SECTION ─────── */}
            <div className="card">
                <h2>⛽ New Fuel Log</h2>
                <form onSubmit={handleFuelSubmit} className="form-grid">
                    <div className="form-group">
                        <label htmlFor="fuel-vehicleId">Vehicle ID</label>
                        <input id="fuel-vehicleId" name="vehicleId" type="number" placeholder="e.g. 1"
                            value={fuelForm.vehicleId} onChange={handleFuelChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fuel-liters">Liters</label>
                        <input id="fuel-liters" name="liters" type="number" step="0.01" placeholder="0.00"
                            value={fuelForm.liters} onChange={handleFuelChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fuel-cost">Cost (₹)</label>
                        <input id="fuel-cost" name="cost" type="number" step="0.01" placeholder="0.00"
                            value={fuelForm.cost} onChange={handleFuelChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="fuel-logDate">Date</label>
                        <input id="fuel-logDate" name="logDate" type="date"
                            value={fuelForm.logDate} onChange={handleFuelChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">+ Add Fuel Log</button>
                </form>
            </div>

            <div className="card">
                <h2>Fuel Log History</h2>
                {fuelLogs.length === 0 ? (
                    <p className="empty-state">No fuel logs found.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle ID</th>
                                    <th>Liters</th>
                                    <th>Cost</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {fuelLogs.map((f) => (
                                    <tr key={f.id}>
                                        <td>{f.id}</td>
                                        <td>{f.vehicleId}</td>
                                        <td>{f.liters}</td>
                                        <td>₹{f.cost?.toFixed(2)}</td>
                                        <td>{f.logDate}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* ─────── EXPENSES SECTION ─────── */}
            <div className="card">
                <h2>💳 New Expense</h2>
                <form onSubmit={handleExpenseSubmit} className="form-grid">
                    <div className="form-group">
                        <label htmlFor="exp-vehicleId">Vehicle ID</label>
                        <input id="exp-vehicleId" name="vehicleId" type="number" placeholder="e.g. 1"
                            value={expenseForm.vehicleId} onChange={handleExpenseChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exp-type">Type</label>
                        <input id="exp-type" name="type" type="text" placeholder="e.g. Toll, Parking"
                            value={expenseForm.type} onChange={handleExpenseChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exp-cost">Cost (₹)</label>
                        <input id="exp-cost" name="cost" type="number" step="0.01" placeholder="0.00"
                            value={expenseForm.cost} onChange={handleExpenseChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="exp-logDate">Date</label>
                        <input id="exp-logDate" name="logDate" type="date"
                            value={expenseForm.logDate} onChange={handleExpenseChange} required />
                    </div>
                    <button type="submit" className="btn btn-primary">+ Add Expense</button>
                </form>
            </div>

            <div className="card">
                <h2>Expense History</h2>
                {expenses.length === 0 ? (
                    <p className="empty-state">No expenses found.</p>
                ) : (
                    <div className="table-wrapper">
                        <table>
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Vehicle ID</th>
                                    <th>Type</th>
                                    <th>Cost</th>
                                    <th>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {expenses.map((ex) => (
                                    <tr key={ex.id}>
                                        <td>{ex.id}</td>
                                        <td>{ex.vehicleId}</td>
                                        <td>{ex.type}</td>
                                        <td>₹{ex.cost?.toFixed(2)}</td>
                                        <td>{ex.logDate}</td>
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
