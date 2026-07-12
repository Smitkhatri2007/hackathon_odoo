import { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import Modal from '../components/Modal';

const API_BASE = 'http://localhost:8080/api';

/* ── Color Palette ─────────────────────────────────────────────── */
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  muted: '#64748b',
  bg: '#0f172a',
  card: 'rgba(30, 41, 59, 0.7)',
  cardBorder: 'rgba(99, 102, 241, 0.2)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
};

const PIE_COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444'];
const BAR_COLORS = { AVAILABLE: '#10b981', ON_TRIP: '#6366f1', IN_SHOP: '#f59e0b', RETIRED: '#64748b' };

/* ── KPI Card Config ───────────────────────────────────────────── */
const KPI_CONFIG = [
  { key: 'activeVehicles',        label: 'Active Vehicles',        icon: '🚛', color: COLORS.primary, description: 'The total number of vehicles currently registered in the fleet, excluding those that have been retired. This represents your core operational capacity.' },
  { key: 'availableVehicles',     label: 'Available Vehicles',     icon: '✅', color: COLORS.success, description: 'Vehicles that are currently in the depot, fully maintained, and ready to be dispatched for new trips immediately.' },
  { key: 'vehiclesInMaintenance', label: 'In Maintenance',         icon: '🔧', color: COLORS.warning, description: 'Vehicles that are currently undergoing repairs or scheduled maintenance. These vehicles cannot be dispatched until maintenance is logged as completed.' },
  { key: 'activeTrips',           label: 'Active Trips',           icon: '🛣️', color: COLORS.info, description: 'Trips that have been dispatched and are currently en route to their destination.' },
  { key: 'pendingTrips',          label: 'Pending Trips',          icon: '📋', color: COLORS.secondary, description: 'Trips that have been drafted but not yet dispatched. A vehicle and driver must be assigned to move them to Active status.' },
  { key: 'driversOnDuty',         label: 'Drivers on Duty',        icon: '👤', color: COLORS.danger, description: 'The number of drivers currently assigned to Active Trips and out on the road.' },
  { key: 'fleetUtilizationPercent', label: 'Fleet Utilization',    icon: '📊', color: COLORS.primary, suffix: '%', description: 'The percentage of your total active fleet that is currently dispatched on a trip. Higher percentages indicate better asset usage.' },
  { key: 'fuelEfficiency',        label: 'Fuel Efficiency',        icon: '⛽', color: COLORS.success, suffix: ' km/L', description: 'The average fuel efficiency across all completed trips. Monitored closely to manage fuel expenses and detect vehicle engine health.' },
  { key: 'operationalCost',       label: 'Operational Cost',       icon: '💸', color: COLORS.danger, prefix: '₹', description: 'The total incurred expenses across the fleet, primarily driven by fuel consumption and maintenance logs.' },
  { key: 'vehicleRoi',            label: 'Fleet ROI',              icon: '📈', color: COLORS.primary, suffix: '%', description: 'Return on Investment (ROI). Calculated by comparing Total Revenue generated from trips against Total Vehicle Acquisition Costs + Operational Costs.' },
];

/* ── AI Insights ───────────────────────────────────────────────── */
const INSIGHTS = [
  { icon: '🤖', text: 'Vehicle MH-12-AB-1234 has reached 15,000 km. Recommend oil change to prevent efficiency drop.', type: 'warning' },
  { icon: '⭐', text: 'Driver John Doe has maintained a 95% safety score this week. Excellent performance!', type: 'success' },
  { icon: '💡', text: 'Fuel costs are trending 12% higher. Consider re-routing deliveries through Highway 4.', type: 'info' }
];

/* ── Styles ────────────────────────────────────────────────────── */
const styles = {
  page: {
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${COLORS.bg} 0%, #1e1b4b 50%, ${COLORS.bg} 100%)`,
    color: COLORS.text,
    padding: '2rem',
    fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  title: {
    fontSize: '2rem',
    fontWeight: 700,
    background: 'linear-gradient(135deg, #6366f1, #a78bfa)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: '0.25rem',
  },
  subtitle: {
    color: COLORS.textMuted,
    fontSize: '0.95rem',
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1.25rem',
    marginBottom: '2.5rem',
  },
  kpiCard: (color) => ({
    background: COLORS.card,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: '16px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    cursor: 'default',
    borderTop: `3px solid ${color}`,
  }),
  kpiIcon: {
    fontSize: '1.75rem',
  },
  kpiValue: {
    fontSize: '2rem',
    fontWeight: 700,
    lineHeight: 1,
  },
  kpiLabel: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    fontWeight: 500,
    letterSpacing: '0.02em',
  },
  chartsRow: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
    gap: '1.5rem',
    marginBottom: '2rem',
  },
  chartCard: {
    background: COLORS.card,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: '16px',
    padding: '1.5rem',
  },
  chartTitle: {
    fontSize: '1.1rem',
    fontWeight: 600,
    marginBottom: '1rem',
    color: COLORS.text,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
    fontSize: '1.2rem',
    color: COLORS.textMuted,
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '1.5rem',
    color: '#fca5a5',
    textAlign: 'center',
    margin: '2rem auto',
    maxWidth: '600px',
  },
  filterBar: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1.5rem',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  filterSelect: {
    background: 'rgba(30, 41, 59, 0.9)',
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: '8px',
    color: COLORS.text,
    padding: '0.5rem 1rem',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  },
  filterLabel: {
    color: COLORS.textMuted,
    fontSize: '0.85rem',
    fontWeight: 500,
  },
};

/* ── Tooltip styles for Recharts ───────────────────────────────── */
const CustomTooltipStyle = {
  background: 'rgba(15, 23, 42, 0.95)',
  border: `1px solid ${COLORS.cardBorder}`,
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  color: COLORS.text,
  fontSize: '0.85rem',
};

export default function Dashboard() {
  const [kpis, setKpis] = useState(null);
  const [vehicleBreakdown, setVehicleBreakdown] = useState([]);
  const [tripBreakdown, setTripBreakdown] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [hovered, setHovered] = useState(null);
  const [activeKpi, setActiveKpi] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    fetchDashboardData();
  }, [filterType, filterStatus]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (filterType) params.append('type', filterType);
      if (filterStatus) params.append('status', filterStatus);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const res = await axiosInstance.get(`/dashboard/kpis${queryString}`);

      if (res.data.success) {
        setKpis(res.data.data.kpis);

        // Transform breakdowns for Recharts
        const vb = res.data.data.vehicleStatusBreakdown;
        setVehicleBreakdown(
          Object.entries(vb).map(([status, count]) => ({ status, count }))
        );

        const tb = res.data.data.tripStatusBreakdown;
        setTripBreakdown(
          Object.entries(tb).map(([status, count]) => ({ name: status, value: count }))
        );
        setLastUpdated(new Date().toLocaleTimeString());
      } else {
        setError(res.data.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={styles.loading}>
        <div>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem', textAlign: 'center' }}>⏳</div>
          <div>Loading dashboard data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.page}>
        <div style={styles.error}>
          <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>⚠️ Error</div>
          <div>{error}</div>
          <button
            onClick={fetchDashboardData}
            style={{
              marginTop: '1rem',
              padding: '0.5rem 1.5rem',
              background: COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '0.9rem',
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Fleet Dashboard</h1>
          <p style={styles.subtitle}>Real-time fleet operations overview</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: COLORS.textMuted, fontSize: '0.85rem' }}>
            Last updated: {lastUpdated}
          </span>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            style={{
              padding: '0.5rem 1rem',
              background: 'rgba(99, 102, 241, 0.1)',
              color: COLORS.primary,
              border: `1px solid ${COLORS.primary}`,
              borderRadius: '8px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              transition: 'all 0.2s',
            }}
          >
            {loading ? '🔄 Refreshing...' : '🔄 Refresh'}
          </button>
          <button
            onClick={() => window.print()}
            style={{
              padding: '0.5rem 1.25rem',
              background: `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)'
            }}
          >
            🖨️ Export PDF
          </button>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <span style={styles.filterLabel}>Filter by:</span>
        <select
          style={styles.filterSelect}
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="">All Vehicle Types</option>
          <option value="TRUCK">Truck</option>
          <option value="BUS">Bus</option>
          <option value="VAN">Van</option>
          <option value="CAR">Car</option>
        </select>
        <select
          style={styles.filterSelect}
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="AVAILABLE">Available</option>
          <option value="ON_TRIP">On Trip</option>
          <option value="IN_SHOP">In Shop</option>
          <option value="RETIRED">Retired</option>
        </select>
      </div>

      {/* KPI Cards */}
      <div style={styles.kpiGrid}>
        {KPI_CONFIG.map((kpi) => {
          const value = kpis?.[kpi.key] ?? 0;
          if (value === 0) return null; // Hide if 0

          return (
            <div
              key={kpi.key}
              onClick={() => setActiveKpi({ ...kpi, value })}
              style={{
                ...styles.kpiCard(kpi.color),
                cursor: 'pointer',
                transform: hovered === kpi.key ? 'translateY(-4px)' : 'none',
                boxShadow: hovered === kpi.key
                  ? `0 8px 30px ${kpi.color}33`
                  : '0 4px 12px rgba(0,0,0,0.2)',
              }}
              onMouseEnter={() => setHovered(kpi.key)}
              onMouseLeave={() => setHovered(null)}
            >
              <div style={styles.kpiIcon}>{kpi.icon}</div>
              <div style={styles.kpiValue}>
                {kpi.prefix || ''}{value}{kpi.suffix || ''}
              </div>
              <div style={styles.kpiLabel}>{kpi.label}</div>
            </div>
          );
        })}
      </div>

      {/* AI Insights (Bonus Feature) */}
      <div style={{ ...styles.chartCard, marginBottom: '2rem', borderTop: `3px solid ${COLORS.secondary}` }}>
        <div style={{ ...styles.chartTitle, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          ✨ AI Fleet Insights
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {INSIGHTS.map((insight, idx) => (
            <div key={idx} style={{
              display: 'flex', alignItems: 'flex-start', gap: '1rem',
              padding: '1rem', background: 'rgba(15, 23, 42, 0.4)', borderRadius: '8px',
              borderLeft: `4px solid ${COLORS[insight.type]}`
            }}>
              <span style={{ fontSize: '1.5rem' }}>{insight.icon}</span>
              <p style={{ margin: 0, color: COLORS.text, fontSize: '0.95rem', lineHeight: '1.5' }}>
                {insight.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div style={styles.chartsRow}>
        {/* Bar Chart — Vehicle Status Breakdown */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Vehicle Status Breakdown</div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={vehicleBreakdown}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
              <XAxis
                dataKey="status"
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
              />
              <YAxis
                tick={{ fill: COLORS.textMuted, fontSize: 12 }}
                axisLine={{ stroke: 'rgba(148,163,184,0.2)' }}
                allowDecimals={false}
              />
              <Tooltip contentStyle={CustomTooltipStyle} cursor={{ fill: 'rgba(148,163,184,0.1)' }} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                {vehicleBreakdown.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={BAR_COLORS[entry.status] || COLORS.primary}
                    onClick={() => setFilterStatus(entry.status === filterStatus ? '' : entry.status)}
                    style={{ cursor: 'pointer', filter: filterStatus && filterStatus !== entry.status ? 'opacity(0.3)' : 'none', transition: 'all 0.2s' }}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart — Trip Status Breakdown */}
        <div style={styles.chartCard}>
          <div style={styles.chartTitle}>Trip Status Breakdown</div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tripBreakdown}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
                labelLine={{ stroke: COLORS.textMuted }}
              >
                {tripBreakdown.map((entry, idx) => (
                  <Cell
                    key={`cell-${idx}`}
                    fill={PIE_COLORS[idx % PIE_COLORS.length]}
                    onClick={() => setFilterStatus(entry.name === filterStatus ? '' : entry.name)}
                    style={{ cursor: 'pointer', filter: filterStatus && filterStatus !== entry.name ? 'opacity(0.3)' : 'none', transition: 'all 0.2s' }}
                  />
                ))}
              </Pie>
              <Tooltip contentStyle={CustomTooltipStyle} />
              <Legend
                wrapperStyle={{ color: COLORS.textMuted, fontSize: '0.85rem' }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* KPI Detail Modal */}
      {activeKpi && (
        <Modal isOpen={!!activeKpi} onClose={() => setActiveKpi(null)} title={`${activeKpi.icon} ${activeKpi.label} Details`}>
          <div style={{ padding: '1rem', background: 'rgba(15, 23, 42, 0.5)', borderRadius: '8px', border: `1px solid ${activeKpi.color}33` }}>
            <h3 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: activeKpi.color }}>
              {activeKpi.prefix || ''}{activeKpi.value}{activeKpi.suffix || ''}
            </h3>
            <p style={{ color: COLORS.textMuted, fontSize: '1rem', lineHeight: '1.6' }}>
              {activeKpi.description}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button 
                onClick={() => setActiveKpi(null)}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: activeKpi.color,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
