import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, currentRole } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="navbar-logo">🚛</span>
        <span className="navbar-title">TransitOps</span>
      </div>
      <div className="navbar-links">
        <NavLink to="/vehicles" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">🚗</span> Vehicles
        </NavLink>
        <NavLink to="/drivers" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          <span className="nav-icon">👤</span> Drivers
        </NavLink>
        {/* TEAMMATE: add your <NavLink> here for Trips */}
        {/* TEAMMATE: add your <NavLink> here for Maintenance */}
        {/* TEAMMATE: add your <NavLink> here for Fuel & Expenses */}
        {/* TEAMMATE: add your <NavLink> here for Dashboard */}
      </div>
      <div className="navbar-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role">{currentRole?.replace('_', ' ')}</span>
        </div>
        <button className="btn-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
