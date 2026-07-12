import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import Modal from '../components/Modal';
import GlassCard from '../components/GlassCard';
import ModernTable from '../components/ModernTable';

const USER_ROLES = ['FLEET_MANAGER', 'DRIVER', 'SAFETY_OFFICER', 'FINANCIAL_ANALYST'];

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'DRIVER',
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get('/users');
      setUsers(res.data.data || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
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

  const openEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: '', // Empty on purpose for edit
      role: user.role,
    });
    setEditing(user.id);
    setError('');
    setModalOpen(true);
  };

  const validateForm = () => {
    if (!form.name.trim()) return "Name is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) return "Invalid email address.";
    if (!editing && form.password.length < 4) return "Password must be at least 4 characters.";
    if (editing && form.password && form.password.length < 4) return "Password must be at least 4 characters.";
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      if (editing) {
        await axiosInstance.put(`/users/${editing}`, form);
        setSuccessMsg('User updated successfully');
      } else {
        await axiosInstance.post('/users', form);
        setSuccessMsg('User created successfully');
      }
      setModalOpen(false);
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axiosInstance.delete(`/users/${id}`);
      setSuccessMsg('User deleted successfully');
      fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const renderBadge = (role) => {
    const colors = {
      FLEET_MANAGER: { bg: 'rgba(16, 185, 129, 0.2)', color: '#34d399', border: 'rgba(16,185,129,0.3)' },
      DRIVER: { bg: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', border: 'rgba(99,102,241,0.3)' },
      SAFETY_OFFICER: { bg: 'rgba(245, 158, 11, 0.2)', color: '#fbbf24', border: 'rgba(245,158,11,0.3)' },
      FINANCIAL_ANALYST: { bg: 'rgba(100, 116, 139, 0.2)', color: '#94a3b8', border: 'rgba(100,116,139,0.3)' },
    };
    const style = colors[role] || colors.DRIVER;
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
        {role?.replace('_', ' ')}
      </span>
    );
  };

  const tableHeaders = ['ID', 'Name', 'Email', 'Role', 'Actions'];
  const renderRow = (u) => (
    <>
      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-muted)' }}>#{u.id}</td>
      <td style={{ padding: '1rem', fontWeight: 500 }}>{u.name}</td>
      <td style={{ padding: '1rem', color: 'var(--color-info)' }}>{u.email}</td>
      <td style={{ padding: '1rem' }}>{renderBadge(u.role)}</td>
      <td style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button
            onClick={(e) => { e.stopPropagation(); openEdit(u); }}
            style={{
              background: 'rgba(99, 102, 241, 0.1)', color: 'var(--color-primary)',
              border: '1px solid rgba(99,102,241,0.2)', padding: '0.4rem 0.8rem',
              borderRadius: '6px', fontSize: '0.85rem'
            }}
          >
            Edit
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); handleDelete(u.id); }}
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
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">Manage system users and roles</p>
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
          + Add User
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
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
        ) : (
          <ModernTable headers={tableHeaders} data={users} renderRow={renderRow} emptyMessage="No users found." />
        )}
      </GlassCard>

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit User' : 'Add User'}>
        {error && modalOpen && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1rem', border: '1px solid rgba(239,68,68,0.2)' }}>
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1rem', marginBottom: '1.5rem' }}>
            <div>
              <label>Name</label>
              <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label>Email</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label>Password {editing && "(Leave blank to keep current)"}</label>
              <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required={!editing} />
            </div>
            <div>
              <label>Role</label>
              <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                {USER_ROLES.map(r => <option key={r} value={r} style={{ background: 'var(--bg-main)' }}>{r.replace('_', ' ')}</option>)}
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

export default Users;
