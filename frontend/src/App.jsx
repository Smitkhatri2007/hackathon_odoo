import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Maintenance from './pages/Maintenance';
import FuelExpense from './pages/FuelExpense';

function App() {
  return (
    <BrowserRouter>
      <nav className="navbar">
        <div className="navbar-brand">
          <span className="logo">🚛</span>
          <span className="brand-name">TransitOps</span>
        </div>
        <div className="nav-links">
          {/* Person 1 will add Login, Vehicles, Drivers links */}
          {/* Person 2 will add Trips link */}
          <Link to="/maintenance" className="nav-link">🔧 Maintenance</Link>
          <Link to="/fuel-expense" className="nav-link">⛽ Fuel & Expenses</Link>
          {/* Person 4 will add Dashboard, Reports links */}
        </div>
      </nav>

      <main className="main-content">
        <Routes>
          <Route path="/" element={<div className="page-container"><div className="page-header"><h1>🚛 Welcome to TransitOps</h1><p className="subtitle">Fleet & Transport Operations Platform</p></div></div>} />
          {/* Person 1 will add Login, Vehicles, Drivers routes */}
          {/* Person 2 will add Trips route */}
          <Route path="/maintenance" element={<Maintenance />} />
          <Route path="/fuel-expense" element={<FuelExpense />} />
          {/* Person 4 will add Dashboard, Reports routes */}
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;
