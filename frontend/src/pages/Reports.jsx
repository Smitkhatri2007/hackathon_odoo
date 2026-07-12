import { useState, useEffect } from 'react';
import axios from 'axios';

const API_BASE = 'http://localhost:8080/api';

/* ── Color Palette (matches Dashboard.jsx) ─────────────────────── */
const COLORS = {
  primary: '#6366f1',
  secondary: '#8b5cf6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  bg: '#0f172a',
  card: 'rgba(30, 41, 59, 0.7)',
  cardBorder: 'rgba(99, 102, 241, 0.2)',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
};

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
    marginBottom: '2rem',
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
  tabBar: {
    display: 'flex',
    gap: '0.5rem',
    marginBottom: '2rem',
    flexWrap: 'wrap',
  },
  tab: (active) => ({
    padding: '0.7rem 1.5rem',
    borderRadius: '10px',
    border: `1px solid ${active ? COLORS.primary : COLORS.cardBorder}`,
    background: active
      ? `linear-gradient(135deg, ${COLORS.primary}, ${COLORS.secondary})`
      : COLORS.card,
    color: active ? '#fff' : COLORS.textMuted,
    cursor: 'pointer',
    fontWeight: active ? 600 : 400,
    fontSize: '0.9rem',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(12px)',
  }),
  tableCard: {
    background: COLORS.card,
    backdropFilter: 'blur(16px)',
    border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: '16px',
    padding: '1.5rem',
    overflowX: 'auto',
  },
  tableHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    flexWrap: 'wrap',
    gap: '0.75rem',
  },
  tableTitle: {
    fontSize: '1.15rem',
    fontWeight: 600,
  },
  exportBtn: {
    padding: '0.5rem 1.25rem',
    borderRadius: '8px',
    border: 'none',
    background: `linear-gradient(135deg, ${COLORS.success}, #059669)`,
    color: '#fff',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: 500,
    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: '0 0.35rem',
    minWidth: '600px',
  },
  th: {
    textAlign: 'left',
    padding: '0.75rem 1rem',
    color: COLORS.textMuted,
    fontWeight: 600,
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: `1px solid ${COLORS.cardBorder}`,
  },
  td: {
    padding: '0.75rem 1rem',
    fontSize: '0.9rem',
    color: COLORS.text,
    borderBottom: `1px solid rgba(99, 102, 241, 0.08)`,
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '200px',
    color: COLORS.textMuted,
  },
  error: {
    background: 'rgba(239, 68, 68, 0.1)',
    border: '1px solid rgba(239, 68, 68, 0.3)',
    borderRadius: '12px',
    padding: '1.25rem',
    color: '#fca5a5',
    textAlign: 'center',
    margin: '1rem 0',
  },
  badge: (color) => ({
    display: 'inline-block',
    padding: '0.2rem 0.6rem',
    borderRadius: '6px',
    background: `${color}22`,
    color: color,
    fontSize: '0.8rem',
    fontWeight: 600,
  }),
  utilizationCard: {
    display: 'flex',
    gap: '2rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
    padding: '2rem',
  },
  utilizationMetric: {
    textAlign: 'center',
    minWidth: '160px',
  },
  utilizationValue: {
    fontSize: '2.5rem',
    fontWeight: 700,
    lineHeight: 1.2,
  },
  utilizationLabel: {
    fontSize: '0.85rem',
    color: COLORS.textMuted,
    marginTop: '0.25rem',
  },
  progressBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(148,163,184,0.15)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '0.75rem',
  },
};

/* ── CSV Export Utility ────────────────────────────────────────── */
function exportToCSV(data, filename) {
  if (!data || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(','),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? '';
        // Escape commas and quotes
        const str = String(val);
        return str.includes(',') || str.includes('"')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    )
  ];

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/* ── Tab Definitions ───────────────────────────────────────────── */
const TABS = [
  { id: 'fuel', label: '⛽ Fuel Efficiency', endpoint: '/reports/fuel-efficiency' },
  { id: 'utilization', label: '📊 Fleet Utilization', endpoint: '/reports/fleet-utilization' },
  { id: 'cost', label: '💰 Operational Cost', endpoint: '/reports/operational-cost' },
];

export default function Reports() {
  const [activeTab, setActiveTab] = useState('fuel');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchReport();
  }, [activeTab]);

  const fetchReport = async () => {
    const tab = TABS.find(t => t.id === activeTab);
    if (!tab) return;

    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${API_BASE}${tab.endpoint}`);

      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError(res.data.message || 'Failed to load report');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div style={styles.loading}>
          <div>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem', textAlign: 'center' }}>⏳</div>
            <div>Loading report data...</div>
          </div>
        </div>
      );
    }

    if (error) {
      return (
        <div style={styles.error}>
          <div style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>⚠️ Error</div>
          <div>{error}</div>
          <button
            onClick={fetchReport}
            style={{
              marginTop: '0.75rem',
              padding: '0.4rem 1.25rem',
              background: COLORS.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    switch (activeTab) {
      case 'fuel':
        return renderFuelEfficiency();
      case 'utilization':
        return renderFleetUtilization();
      case 'cost':
        return renderOperationalCost();
      default:
        return null;
    }
  };

  /* ── Fuel Efficiency Table ───────────────────────────────────── */
  const renderFuelEfficiency = () => {
    const rows = Array.isArray(data) ? data : [];

    return (
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitle}>Fuel Efficiency per Vehicle (km/L)</div>
          <button
            style={styles.exportBtn}
            onClick={() => exportToCSV(rows, 'fuel_efficiency_report')}
          >
            📥 Export CSV
          </button>
        </div>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: COLORS.textMuted }}>
            No completed trips with fuel data found.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Vehicle ID</th>
                <th style={styles.th}>Registration</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Total Distance (km)</th>
                <th style={styles.th}>Total Fuel (L)</th>
                <th style={styles.th}>Efficiency (km/L)</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={styles.td}>{row.vehicleId}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(COLORS.info)}>
                      {row.registrationNumber}
                    </span>
                  </td>
                  <td style={styles.td}>{row.vehicleName}</td>
                  <td style={styles.td}>{Number(row.totalDistance || 0).toLocaleString('en-IN')}</td>
                  <td style={styles.td}>{Number(row.totalFuel || 0).toLocaleString('en-IN')}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(
                      Number(row.kmPerLiter) >= 8 ? COLORS.success
                        : Number(row.kmPerLiter) >= 5 ? COLORS.warning
                          : COLORS.danger
                    )}>
                      {Number(row.kmPerLiter || 0).toFixed(2)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  /* ── Fleet Utilization ───────────────────────────────────────── */
  const renderFleetUtilization = () => {
    const util = data || {};
    const pct = Number(util.utilizationPercent || 0);
    const csvData = [{
      vehiclesOnTrip: util.vehiclesOnTrip || 0,
      totalActiveVehicles: util.totalActiveVehicles || 0,
      utilizationPercent: pct,
    }];

    return (
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitle}>Fleet Utilization Overview</div>
          <button
            style={styles.exportBtn}
            onClick={() => exportToCSV(csvData, 'fleet_utilization_report')}
          >
            📥 Export CSV
          </button>
        </div>
        <div style={styles.utilizationCard}>
          <div style={styles.utilizationMetric}>
            <div style={{ ...styles.utilizationValue, color: COLORS.primary }}>
              {util.vehiclesOnTrip ?? 0}
            </div>
            <div style={styles.utilizationLabel}>Vehicles on Trip</div>
          </div>
          <div style={styles.utilizationMetric}>
            <div style={{ ...styles.utilizationValue, color: COLORS.success }}>
              {util.totalActiveVehicles ?? 0}
            </div>
            <div style={styles.utilizationLabel}>Total Active Vehicles</div>
          </div>
          <div style={styles.utilizationMetric}>
            <div style={{
              ...styles.utilizationValue,
              color: pct >= 70 ? COLORS.success : pct >= 40 ? COLORS.warning : COLORS.danger,
            }}>
              {pct.toFixed(1)}%
            </div>
            <div style={styles.utilizationLabel}>Utilization Rate</div>
            <div style={styles.progressBar}>
              <div
                style={{
                  width: `${Math.min(pct, 100)}%`,
                  height: '100%',
                  background: `linear-gradient(90deg, ${COLORS.primary}, ${COLORS.success})`,
                  borderRadius: '4px',
                  transition: 'width 0.8s ease',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  };

  /* ── Operational Cost Table ──────────────────────────────────── */
  const renderOperationalCost = () => {
    const rows = Array.isArray(data) ? data : [];

    return (
      <div style={styles.tableCard}>
        <div style={styles.tableHeader}>
          <div style={styles.tableTitle}>Operational Cost per Vehicle</div>
          <button
            style={styles.exportBtn}
            onClick={() => exportToCSV(rows, 'operational_cost_report')}
          >
            📥 Export CSV
          </button>
        </div>
        {rows.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: COLORS.textMuted }}>
            No cost data found.
          </div>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Vehicle ID</th>
                <th style={styles.th}>Registration</th>
                <th style={styles.th}>Name</th>
                <th style={styles.th}>Maintenance Cost</th>
                <th style={styles.th}>Fuel Cost</th>
                <th style={styles.th}>Total Cost</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i}>
                  <td style={styles.td}>{row.vehicleId}</td>
                  <td style={styles.td}>
                    <span style={styles.badge(COLORS.info)}>
                      {row.registrationNumber}
                    </span>
                  </td>
                  <td style={styles.td}>{row.vehicleName}</td>
                  <td style={styles.td}>₹{Number(row.maintenanceCost || 0).toLocaleString('en-IN')}</td>
                  <td style={styles.td}>₹{Number(row.fuelCost || 0).toLocaleString('en-IN')}</td>
                  <td style={styles.td}>
                    <span style={{
                      fontWeight: 700,
                      color: Number(row.totalCost) > 50000 ? COLORS.danger
                        : Number(row.totalCost) > 20000 ? COLORS.warning
                          : COLORS.success,
                    }}>
                      ₹{Number(row.totalCost || 0).toLocaleString('en-IN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    );
  };

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Reports & Analytics</h1>
        <p style={styles.subtitle}>Fleet performance insights and cost analysis</p>
      </div>

      {/* Tab Bar */}
      <div style={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            style={styles.tab(activeTab === tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}
    </div>
  );
}
