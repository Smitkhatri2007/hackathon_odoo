package com.transitops.dashboard;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DashboardService — KPI query logic using NamedParameterJdbcTemplate.
 *
 * All queries use native SQL against the shared schema tables (vehicles, trips, drivers).
 * No JPA entities are imported — this module compiles independently of teammate classes.
 *
 * Optional filters (?type=...&status=...) are applied via parameterized WHERE clauses
 * built dynamically — never via string concatenation — to prevent SQL injection.
 */
@Service
public class DashboardService {

    private final NamedParameterJdbcTemplate jdbc;

    public DashboardService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    /**
     * Returns all 7 KPI metrics for the dashboard.
     *
     * @param type   optional vehicle type filter (e.g., "TRUCK", "BUS")
     * @param status optional vehicle status filter (e.g., "AVAILABLE")
     * @return Map with all 7 KPI values
     */
    public Map<String, Object> getKpis(String type, String status) {
        Map<String, Object> kpis = new LinkedHashMap<>();

        // Build reusable vehicle filter clause + params
        StringBuilder vehicleFilter = new StringBuilder();
        MapSqlParameterSource params = new MapSqlParameterSource();

        if (type != null && !type.isBlank()) {
            vehicleFilter.append(" AND v.type = :type");
            params.addValue("type", type);
        }
        if (status != null && !status.isBlank()) {
            vehicleFilter.append(" AND v.status = :status");
            params.addValue("status", status);
        }

        String filterClause = vehicleFilter.toString();

        // 1. Active Vehicles: count where status != 'RETIRED'
        kpis.put("activeVehicles", jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles v WHERE v.status != 'RETIRED'" + filterClause,
                params, Long.class));

        // 2. Available Vehicles: count where status = 'AVAILABLE'
        kpis.put("availableVehicles", jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles v WHERE v.status = 'AVAILABLE'" + filterClause,
                params, Long.class));

        // 3. Vehicles In Maintenance: count where status = 'IN_SHOP'
        kpis.put("vehiclesInMaintenance", jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles v WHERE v.status = 'IN_SHOP'" + filterClause,
                params, Long.class));

        // 4. Active Trips: count where status = 'DISPATCHED'
        //    (trip queries are NOT filtered by vehicle type/status — they reflect trip-level data)
        kpis.put("activeTrips", jdbc.queryForObject(
                "SELECT COUNT(*) FROM trips WHERE status = 'DISPATCHED'",
                new MapSqlParameterSource(), Long.class));

        // 5. Pending Trips: count where status = 'DRAFT'
        kpis.put("pendingTrips", jdbc.queryForObject(
                "SELECT COUNT(*) FROM trips WHERE status = 'DRAFT'",
                new MapSqlParameterSource(), Long.class));

        // 6. Drivers On Duty: count where status = 'ON_TRIP' (from drivers table)
        kpis.put("driversOnDuty", jdbc.queryForObject(
                "SELECT COUNT(*) FROM drivers WHERE status = 'ON_TRIP'",
                new MapSqlParameterSource(), Long.class));

        // 7. Fleet Utilization %: (ON_TRIP / non-RETIRED) * 100
        //    Uses the same vehicle filter so the percentage reflects the filtered subset
        Long onTrip = jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles v WHERE v.status = 'ON_TRIP'" + filterClause,
                params, Long.class);

        Long nonRetired = jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles v WHERE v.status != 'RETIRED'" + filterClause,
                params, Long.class);

        double utilization = (nonRetired != null && nonRetired > 0 && onTrip != null)
                ? (onTrip * 100.0) / nonRetired
                : 0.0;
        kpis.put("fleetUtilizationPercent", Math.round(utilization * 100.0) / 100.0);

        // 8. Fuel Efficiency (km/L) = SUM(actual_distance) / SUM(fuel_consumed)
        Double totalDist = jdbc.queryForObject("SELECT SUM(actual_distance) FROM trips WHERE status = 'COMPLETED'", new MapSqlParameterSource(), Double.class);
        Double totalFuel = jdbc.queryForObject("SELECT SUM(fuel_consumed) FROM trips WHERE status = 'COMPLETED'", new MapSqlParameterSource(), Double.class);
        double fuelEfficiency = (totalDist != null && totalFuel != null && totalFuel > 0) ? totalDist / totalFuel : 0.0;
        kpis.put("fuelEfficiency", Math.round(fuelEfficiency * 100.0) / 100.0);

        // 9. Operational Cost = Fuel Cost + Maintenance Cost + Other Expenses
        Double fuelCost = jdbc.queryForObject("SELECT SUM(cost) FROM fuel_logs", new MapSqlParameterSource(), Double.class);
        Double maintCost = jdbc.queryForObject("SELECT SUM(cost) FROM maintenance_logs", new MapSqlParameterSource(), Double.class);
        Double expCost = jdbc.queryForObject("SELECT SUM(cost) FROM expenses", new MapSqlParameterSource(), Double.class);
        double totalOpsCost = (fuelCost != null ? fuelCost : 0) + (maintCost != null ? maintCost : 0) + (expCost != null ? expCost : 0);
        kpis.put("operationalCost", Math.round(totalOpsCost * 100.0) / 100.0);

        // 10. Vehicle ROI = (Revenue - Operational Cost) / Acquisition Cost * 100
        Double totalRevenue = jdbc.queryForObject("SELECT SUM(revenue) FROM trips", new MapSqlParameterSource(), Double.class);
        Double acqCost = jdbc.queryForObject("SELECT SUM(acquisition_cost) FROM vehicles WHERE status != 'RETIRED'", new MapSqlParameterSource(), Double.class);
        
        double revenue = totalRevenue != null ? totalRevenue : 0;
        double cost = acqCost != null && acqCost > 0 ? acqCost : 1; // avoid division by zero
        double roi = ((revenue - totalOpsCost) / cost) * 100.0;
        kpis.put("vehicleRoi", Math.round(roi * 100.0) / 100.0);

        return kpis;
    }

    /**
     * Returns vehicle status breakdown counts for the bar chart.
     * e.g., { "AVAILABLE": 5, "ON_TRIP": 3, "IN_SHOP": 2, "RETIRED": 1 }
     */
    public Map<String, Long> getVehicleStatusBreakdown() {
        Map<String, Long> breakdown = new LinkedHashMap<>();
        var rows = jdbc.queryForList(
                "SELECT status, COUNT(*) AS cnt FROM vehicles GROUP BY status",
                new MapSqlParameterSource());

        for (var row : rows) {
            breakdown.put((String) row.get("status"), ((Number) row.get("cnt")).longValue());
        }
        return breakdown;
    }

    /**
     * Returns trip status breakdown counts for the pie chart.
     * e.g., { "DRAFT": 2, "DISPATCHED": 4, "COMPLETED": 10, "CANCELLED": 1 }
     */
    public Map<String, Long> getTripStatusBreakdown() {
        Map<String, Long> breakdown = new LinkedHashMap<>();
        var rows = jdbc.queryForList(
                "SELECT status, COUNT(*) AS cnt FROM trips GROUP BY status",
                new MapSqlParameterSource());

        for (var row : rows) {
            breakdown.put((String) row.get("status"), ((Number) row.get("cnt")).longValue());
        }
        return breakdown;
    }
}
