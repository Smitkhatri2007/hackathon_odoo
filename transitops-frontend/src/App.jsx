import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Trips from './pages/Trips';

// Stub components for teammate modules
function Dashboard() { return <div className="page-stub">Dashboard Module (Teammate's Scope)</div>; }
function Vehicles() { return <div className="page-stub">Vehicle Management (Teammate's Scope)</div>; }
function Drivers() { return <div className="page-stub">Driver Management (Teammate's Scope)</div>; }
function Maintenance() { return <div className="page-stub">Maintenance Logs (Teammate's Scope)</div>; }

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-container">
        {/* Navigation Sidebar */}
        <aside className="sidebar">
          <div className="logo-container">
            <h1 className="logo-text">Transit<span>Ops</span></h1>
          </div>
          <nav className="nav-menu">
            <Link to="/dashboard" className="nav-link">Dashboard</Link>
            <Link to="/trips" className="nav-link active">Trips</Link>
            <Link to="/vehicles" className="nav-link">Vehicles</Link>
            <Link to="/drivers" className="nav-link">Drivers</Link>
            <Link to="/maintenance" className="nav-link">Maintenance</Link>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="main-content">
          <header className="main-header">
            <div className="user-profile">
              <span className="user-role">Dispatcher Mode</span>
            </div>
          </header>

          <div className="content-body">
            <Routes>
              <Route path="/" element={<Navigate to="/trips" replace />} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              
              {/* @TEAMMATE_PLACEHOLDER: Insert other routes here */}
              <Route path="/trips" element={<ProtectedRoute><Trips /></ProtectedRoute>} />
              
              <Route path="/vehicles" element={<ProtectedRoute><Vehicles /></ProtectedRoute>} />
              <Route path="/drivers" element={<ProtectedRoute><Drivers /></ProtectedRoute>} />
              <Route path="/maintenance" element={<ProtectedRoute><Maintenance /></ProtectedRoute>} />
            </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}
