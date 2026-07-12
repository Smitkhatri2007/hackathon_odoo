import { BrowserRouter as Router, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';

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
// ProtectedRoute — placeholder until Auth module is ready
// Replace this with real JWT check from Person 1's auth module
// =============================================
function ProtectedRoute({ children }) {
  // TODO: Replace with actual auth check (e.g., check JWT in localStorage)
  const isAuthenticated = true; // Allow access during development
  return isAuthenticated ? children : <Navigate to="/login" replace />;
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

  return (
    <nav style={navStyle}>
      <span style={brandStyle}>TransitOps</span>
      {/* Person 1 routes */}
      <Link to="/vehicles" style={linkStyle(location.pathname === '/vehicles')}>Vehicles</Link>
      <Link to="/drivers" style={linkStyle(location.pathname === '/drivers')}>Drivers</Link>
      <Link to="/users" style={linkStyle(location.pathname === '/users')}>Users</Link>

      {/* Person 2 routes */}
      <Link to="/trips" style={linkStyle(location.pathname === '/trips')}>Trips</Link>

      {/* Person 3 routes */}
      <Link to="/maintenance" style={linkStyle(location.pathname === '/maintenance')}>Maintenance</Link>
      <Link to="/fuel-expenses" style={linkStyle(location.pathname === '/fuel-expenses')}>Fuel & Expenses</Link>

      {/* Person 4 routes — DO NOT REMOVE */}
      <Link to="/dashboard" style={linkStyle(location.pathname === '/dashboard')}>Dashboard</Link>
      <Link to="/reports" style={linkStyle(location.pathname === '/reports')}>Reports</Link>
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
