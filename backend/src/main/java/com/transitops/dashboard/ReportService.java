package com.transitops.dashboard;

import org.springframework.dao.DataAccessException;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * ReportService — report query logic using NamedParameterJdbcTemplate.
 *
 * All queries use native SQL against the shared schema tables.
 * No JPA entities are imported — this module compiles independently of teammate classes.
 */
@Service
public class ReportService {

    private final NamedParameterJdbcTemplate jdbc;

    public ReportService(NamedParameterJdbcTemplate jdbc) {
        this.jdbc = jdbc;
    }

    // =========================================================================
    // FUEL EFFICIENCY REPORT
    // =========================================================================

    /**
     * Per-vehicle fuel efficiency: SUM(actual_distance) / SUM(fuel_consumed)
     * from the trips table where status = 'COMPLETED'.
     *
     * WHY TRIPS DATA INSTEAD OF FUEL_LOGS:
     * ─────────────────────────────────────
     * The trips table pairs actual_distance with fuel_consumed for the SAME journey,
     * giving us true per-trip efficiency (km/L). The fuel_logs table records raw
     * refuelling events (liters + cost) but has NO associated distance — we'd need
     * to correlate fueling dates with odometer readings across two tables, which is
     * error-prone and lossy. Using trips.actual_distance / trips.fuel_consumed is
     * the most accurate, self-contained calculation available in this schema.
     */
    public List<Map<String, Object>> getFuelEfficiency() {
        String sql = """
                SELECT t.vehicle_id                                AS vehicleId,
                       v.registration_number                       AS registrationNumber,
                       v.name                                      AS vehicleName,
                       SUM(t.actual_distance)                      AS totalDistance,
                       SUM(t.fuel_consumed)                        AS totalFuel,
                       CASE
                           WHEN SUM(t.fuel_consumed) > 0
                           THEN ROUND(SUM(t.actual_distance) / SUM(t.fuel_consumed), 2)
                           ELSE 0
                       END                                         AS kmPerLiter
                FROM trips t
                JOIN vehicles v ON t.vehicle_id = v.id
                WHERE t.status = 'COMPLETED'
                  AND t.actual_distance IS NOT NULL
                  AND t.fuel_consumed IS NOT NULL
                GROUP BY t.vehicle_id, v.registration_number, v.name
                ORDER BY kmPerLiter DESC
                """;

        return jdbc.queryForList(sql, new MapSqlParameterSource());
    }

    // =========================================================================
    // FLEET UTILIZATION REPORT
    // =========================================================================

    /**
     * Fleet utilization: percentage of vehicles currently ON_TRIP vs total non-RETIRED.
     * Returns a single-row result with onTrip, total, and utilizationPercent.
     */
    public Map<String, Object> getFleetUtilization() {
        Map<String, Object> result = new LinkedHashMap<>();

        Long onTrip = jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles WHERE status = 'ON_TRIP'",
                new MapSqlParameterSource(), Long.class);

        Long total = jdbc.queryForObject(
                "SELECT COUNT(*) FROM vehicles WHERE status != 'RETIRED'",
                new MapSqlParameterSource(), Long.class);

        double pct = (total != null && total > 0 && onTrip != null)
                ? Math.round((onTrip * 100.0 / total) * 100.0) / 100.0
                : 0.0;

        result.put("vehiclesOnTrip", onTrip);
        result.put("totalActiveVehicles", total);
        result.put("utilizationPercent", pct);

        return result;
    }

    // =========================================================================
    // OPERATIONAL COST REPORT
    // =========================================================================

    /**
     * Per-vehicle operational cost: SUM(maintenance_logs.cost) + SUM(fuel_logs.cost).
     * Uses LEFT JOINs so vehicles with zero logs still appear with cost = 0 (not null).
     */
    public List<Map<String, Object>> getOperationalCost() {
        String sql = """
                SELECT v.id                                        AS vehicleId,
                       v.registration_number                       AS registrationNumber,
                       v.name                                      AS vehicleName,
                       COALESCE(m.maintenance_cost, 0)             AS maintenanceCost,
                       COALESCE(f.fuel_cost, 0)                    AS fuelCost,
                       COALESCE(m.maintenance_cost, 0)
                         + COALESCE(f.fuel_cost, 0)                AS totalCost
                FROM vehicles v
                LEFT JOIN (
                    SELECT vehicle_id, SUM(cost) AS maintenance_cost
                    FROM maintenance_logs
                    GROUP BY vehicle_id
                ) m ON v.id = m.vehicle_id
                LEFT JOIN (
                    SELECT vehicle_id, SUM(cost) AS fuel_cost
                    FROM fuel_logs
                    GROUP BY vehicle_id
                ) f ON v.id = f.vehicle_id
                ORDER BY totalCost DESC
                """;

        return jdbc.queryForList(sql, new MapSqlParameterSource());
    }

    // =========================================================================
    // VEHICLE ROI (BONUS)
    // =========================================================================

    /**
     * Vehicle ROI = ((Revenue - Total Cost) / Acquisition Cost) * 100.
     *
     * Known issue: the schema has no "revenue" column on trips.
     * Strategy:
     *   1. Check if trips.revenue column exists at query time.
     *   2. If yes, SUM(revenue) per vehicle from completed trips.
     *   3. If no, accept a manually-entered revenue figure via query param.
     *
     * @param manualRevenue fallback revenue figure if trips.revenue column doesn't exist
     */
    public List<Map<String, Object>> getVehicleRoi(Double manualRevenue) {
        boolean hasRevenueColumn = checkRevenueColumnExists();

        String sql;
        if (hasRevenueColumn) {
            sql = """
                    SELECT v.id                                         AS vehicleId,
                           v.registration_number                        AS registrationNumber,
                           v.name                                       AS vehicleName,
                           v.acquisition_cost                           AS acquisitionCost,
                           COALESCE(r.total_revenue, 0)                 AS totalRevenue,
                           COALESCE(m.maintenance_cost, 0)
                             + COALESCE(f.fuel_cost, 0)                 AS totalCost,
                           CASE
                               WHEN v.acquisition_cost > 0
                               THEN ROUND(
                                   ((COALESCE(r.total_revenue, 0)
                                     - (COALESCE(m.maintenance_cost, 0) + COALESCE(f.fuel_cost, 0)))
                                    / v.acquisition_cost) * 100, 2)
                               ELSE 0
                           END                                          AS roiPercent
                    FROM vehicles v
                    LEFT JOIN (
                        SELECT vehicle_id, SUM(revenue) AS total_revenue
                        FROM trips
                        WHERE status = 'COMPLETED'
                        GROUP BY vehicle_id
                    ) r ON v.id = r.vehicle_id
                    LEFT JOIN (
                        SELECT vehicle_id, SUM(cost) AS maintenance_cost
                        FROM maintenance_logs
                        GROUP BY vehicle_id
                    ) m ON v.id = m.vehicle_id
                    LEFT JOIN (
                        SELECT vehicle_id, SUM(cost) AS fuel_cost
                        FROM fuel_logs
                        GROUP BY vehicle_id
                    ) f ON v.id = f.vehicle_id
                    ORDER BY roiPercent DESC
                    """;
            return jdbc.queryForList(sql, new MapSqlParameterSource());
        } else {
            // Fallback: use manually provided revenue
            double revenue = (manualRevenue != null) ? manualRevenue : 0.0;

            String fallbackSql = """
                    SELECT v.id                                         AS vehicleId,
                           v.registration_number                        AS registrationNumber,
                           v.name                                       AS vehicleName,
                           v.acquisition_cost                           AS acquisitionCost,
                           :revenue                                     AS totalRevenue,
                           COALESCE(m.maintenance_cost, 0)
                             + COALESCE(f.fuel_cost, 0)                 AS totalCost,
                           CASE
                               WHEN v.acquisition_cost > 0
                               THEN ROUND(
                                   ((:revenue
                                     - (COALESCE(m.maintenance_cost, 0) + COALESCE(f.fuel_cost, 0)))
                                    / v.acquisition_cost) * 100, 2)
                               ELSE 0
                           END                                          AS roiPercent
                    FROM vehicles v
                    LEFT JOIN (
                        SELECT vehicle_id, SUM(cost) AS maintenance_cost
                        FROM maintenance_logs
                        GROUP BY vehicle_id
                    ) m ON v.id = m.vehicle_id
                    LEFT JOIN (
                        SELECT vehicle_id, SUM(cost) AS fuel_cost
                        FROM fuel_logs
                        GROUP BY vehicle_id
                    ) f ON v.id = f.vehicle_id
                    ORDER BY roiPercent DESC
                    """;

            MapSqlParameterSource params = new MapSqlParameterSource();
            params.addValue("revenue", revenue);
            return jdbc.queryForList(fallbackSql, params);
        }
    }

    /**
     * Checks if the "revenue" column exists on the trips table.
     * Uses INFORMATION_SCHEMA so the check is safe and read-only.
     */
    private boolean checkRevenueColumnExists() {
        try {
            Long count = jdbc.queryForObject(
                    """
                    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = DATABASE()
                      AND TABLE_NAME = 'trips'
                      AND COLUMN_NAME = 'revenue'
                    """,
                    new MapSqlParameterSource(), Long.class);
            return count != null && count > 0;
        } catch (DataAccessException e) {
            return false;
        }
    }
}
