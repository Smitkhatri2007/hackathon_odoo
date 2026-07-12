import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation, useNavigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';

// =============================================
// TEAMMATE IMPORTS — add your page imports here
// =============================================
// Person 1: Vehicle Management
import Vehicles from './pages/Vehicles';
import Drivers from './pages/Drivers';
import Users from './pages/Users';

// Person 2: Driver & Trip Management
import Trips from './pages/Trips';

// Person 3: Maintenance, Fuel & Expenses
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';

// Person 4: Dashboard & Reports (DO NOT REMOVE)
import Dashboard from './pages/Dashboard';
import Reports from './pages/Reports';

// =============================================
// ProtectedRoute
// =============================================
function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

// =============================================
// Minimal Nav Bar
// =============================================
const navStyle = {
  display: 'flex',
  gap: '1rem',
  padding: '0.75rem 2rem',
  background: 'rgba(15, 23, 42, 0.95)',
  backdropFilter: 'blur(12px)',
  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
  position: 'sticky',
  top: 0,
  zIndex: 100,
  alignItems: 'center',
  flexWrap: 'wrap',
};

const linkStyle = (isActive) => ({
  color: isActive ? '#a78bfa' : '#94a3b8',
  textDecoration: 'none',
  fontWeight: isActive ? 600 : 400,
  fontSize: '0.9rem',
  padding: '0.4rem 0.75rem',
  borderRadius: '6px',
  transition: 'color 0.2s ease',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
});

const brandStyle = {
  color: '#f1f5f9',
  fontWeight: 700,
  fontSize: '1.1rem',
  marginRight: 'auto',
  fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

function NavBar() {
  const location = useLocation();
  const navigate = useNavigate();

  if (location.pathname === '/login' || location.pathname === '/register') return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav style={navStyle} aria-label="Main Navigation">
      <span style={brandStyle} aria-label="TransitOps Brand">TransitOps</span>
      {/* Person 1 routes */}
      <Link to="/vehicles" style={linkStyle(location.pathname === '/vehicles')} aria-label="Vehicles Tab">Vehicles</Link>
      <Link to="/drivers" style={linkStyle(location.pathname === '/drivers')} aria-label="Drivers Tab">Drivers</Link>
      <Link to="/users" style={linkStyle(location.pathname === '/users')} aria-label="Users Tab">Users</Link>

      {/* Person 2 routes */}
      <Link to="/trips" style={linkStyle(location.pathname === '/trips')} aria-label="Trips Tab">Trips</Link>

      {/* Person 3 routes */}
      <Link to="/maintenance" style={linkStyle(location.pathname === '/maintenance')} aria-label="Maintenance Tab">Maintenance</Link>
      <Link to="/fuel-expenses" style={linkStyle(location.pathname === '/fuel-expenses')} aria-label="Fuel & Expenses Tab">Fuel & Expenses</Link>

      {/* Person 4 routes — DO NOT REMOVE */}
      <Link to="/dashboard" style={linkStyle(location.pathname === '/dashboard')} aria-label="Dashboard Tab">Dashboard</Link>
      <Link to="/reports" style={linkStyle(location.pathname === '/reports')} aria-label="Reports Tab">Reports</Link>
      
      <button 
        onClick={handleLogout}
        aria-label="Logout"
        style={{
          marginLeft: 'auto',
          background: 'rgba(239, 68, 68, 0.1)',
          color: '#fca5a5',
          border: '1px solid rgba(239,68,68,0.2)',
          padding: '0.4rem 0.75rem',
          borderRadius: '6px',
          fontWeight: 500,
          fontSize: '0.85rem',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>
    </nav>
  );
}

// =============================================
// App — Main Router
// =============================================
function App() {
  return (
    <Router>
      <NavBar />
      <Routes>
        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* ============================================= */}
        {/* TEAMMATE ROUTES — add your routes below       */}
        {/* ============================================= */}
        {/* Person 1: Vehicle Management */}
        <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
        <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
        <Route path="/users" element={<ProtectedRoute><Users /></ProtectedRoute>} />

        {/* Person 2: Driver & Trip Management */}
        <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />

        {/* Person 3: Maintenance, Fuel & Expenses */}
        <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
        <Route path="/fuel-expenses" element={<ProtectedRoute><FuelExpense /></ProtectedRoute>} />

        {/* ============================================= */}
        {/* Person 4: Dashboard & Reports — DO NOT REMOVE */}
        {/* ============================================= */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><Reports /></ProtectedRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
