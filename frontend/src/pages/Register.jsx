import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';
import GlassCard from '../components/GlassCard';

export default function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'DRIVER'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingGoogle, setVerifyingGoogle] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!form.name.trim()) {
      setError('Name is required.');
      return;
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    if (!emailRegex.test(form.email.toLowerCase())) {
      setError('Only @gmail.com accounts are allowed.');
      return;
    }
    if (form.password.length < 4) {
      setError('Password must be at least 4 characters long.');
      return;
    }

    try {
      setLoading(true);
      setVerifyingGoogle(true);
      
      // Call mock Google API
      await axiosInstance.post('/auth/verify-google', { email: form.email });
      
      setVerifyingGoogle(false);
      
      const res = await axiosInstance.post('/auth/register', form);
      
      if (res.data.success) {
        // Automatically log them in by saving token and redirecting
        const token = res.data.data.token;
        const user = res.data.data.user;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        navigate('/dashboard', { replace: true });
      } else {
        setError(res.data.message || 'Registration failed.');
      }
    } catch (err) {
      setVerifyingGoogle(false);
      setError(err.response?.data?.message || 'Email might already be in use or server error.');
    } finally {
      setLoading(false);
      setVerifyingGoogle(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--bg-main)',
      backgroundImage: 'var(--bg-gradient)',
      padding: '2rem'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{
            fontFamily: 'var(--font-heading)',
            fontSize: '2.5rem',
            fontWeight: 700,
            background: 'var(--bg-gradient-primary)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '0.5rem'
          }}>TransitOps</h1>
          <p style={{ color: 'var(--text-muted)' }}>Create a new account</p>
        </div>

        <GlassCard>
          {error && (
            <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleRegister}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={form.name} 
                  onChange={(e) => setForm({...form, name: e.target.value})} 
                  placeholder="e.g. John Doe"
                  required 
                  disabled={loading}
                />
              </div>
              <div>
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={form.email} 
                  onChange={(e) => setForm({...form, email: e.target.value})} 
                  placeholder="e.g. john@transitops.com"
                  required 
                  disabled={loading}
                />
              </div>
              <div>
                <label>Password</label>
                <input 
                  type="password" 
                  value={form.password} 
                  onChange={(e) => setForm({...form, password: e.target.value})} 
                  placeholder="e.g. *********"
                  required 
                  disabled={loading}
                />
              </div>
              <div>
                <label>Role</label>
                <select 
                  value={form.role} 
                  onChange={(e) => setForm({...form, role: e.target.value})}
                  disabled={loading}
                >
                  <option value="DRIVER" style={{ background: 'var(--bg-main)' }}>DRIVER</option>
                  <option value="FLEET_MANAGER" style={{ background: 'var(--bg-main)' }}>FLEET MANAGER</option>
                  <option value="SAFETY_OFFICER" style={{ background: 'var(--bg-main)' }}>SAFETY OFFICER</option>
                  <option value="FINANCIAL_ANALYST" style={{ background: 'var(--bg-main)' }}>FINANCIAL ANALYST</option>
                </select>
              </div>
              
              <button 
                type="submit" 
                disabled={loading}
                style={{
                  marginTop: '0.5rem',
                  width: '100%',
                  background: 'var(--bg-gradient-primary)',
                  border: 'none',
                  color: '#fff',
                  padding: '0.85rem',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '1rem',
                  boxShadow: 'var(--shadow-glow-primary)',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s ease'
                }}
              >
                {verifyingGoogle ? 'Verifying with Google API...' : (loading ? 'Creating Account...' : 'Sign Up')}
              </button>
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Already have an account? </span>
            <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Sign in here</Link>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
