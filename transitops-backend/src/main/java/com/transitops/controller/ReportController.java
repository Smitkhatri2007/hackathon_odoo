package com.transitops.controller;

import com.transitops.config.DatabaseConfig;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;

import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class ReportController {

    private static boolean wantsCsv(Context ctx) {
        String format = ctx.queryParam("format");
        String acceptHeader = ctx.header("Accept");
        return "csv".equalsIgnoreCase(format) || (acceptHeader != null && acceptHeader.contains("text/csv"));
    }

    private static void sendCsv(Context ctx, String csvContent, String filename) {
        ctx.contentType("text/csv; charset=utf-8");
        ctx.header("Content-Disposition", "attachment; filename=\"" + filename + "\"");
        ctx.result(csvContent);
    }

    /**
     * GET /reports/fuel-efficiency - Distance / Fuel per vehicle
     */
    public static void getFuelEfficiency(Context ctx) {
        List<Map<String, Object>> records = new ArrayList<>();
        String query = 
            "SELECT v.id, v.registration_number, " +
            "       COALESCE(t.total_distance, 0.0) AS total_distance, " +
            "       COALESCE(f.total_liters, 0.0) AS total_liters, " +
            "       CASE WHEN COALESCE(f.total_liters, 0.0) > 0 " +
            "            THEN COALESCE(t.total_distance, 0.0) / f.total_liters " +
            "            ELSE 0.0 " +
            "       END AS fuel_efficiency " +
            "FROM vehicles v " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(distance) AS total_distance " +
            "   FROM trips " +
            "   WHERE status = 'Completed' " +
            "   GROUP BY vehicle_id" +
            ") t ON v.id = t.vehicle_id " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(liters) AS total_liters " +
            "   FROM fuel_logs " +
            "   GROUP BY vehicle_id" +
            ") f ON v.id = f.vehicle_id " +
            "ORDER BY fuel_efficiency DESC, v.id ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            StringBuilder csv = new StringBuilder("Vehicle ID,Registration Number,Total Distance (km),Total Fuel (liters),Fuel Efficiency (km/L)\n");

            while (rs.next()) {
                int id = rs.getInt("id");
                String reg = rs.getString("registration_number");
                double dist = rs.getDouble("total_distance");
                double liters = rs.getDouble("total_liters");
                double efficiency = rs.getDouble("fuel_efficiency");

                if (wantsCsv(ctx)) {
                    csv.append(id).append(",")
                       .append(reg).append(",")
                       .append(dist).append(",")
                       .append(liters).append(",")
                       .append(String.format("%.2f", efficiency)).append("\n");
                } else {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("vehicleId", id);
                    rec.put("vehicleRegistration", reg);
                    rec.put("totalDistance", dist);
                    rec.put("totalLiters", liters);
                    rec.put("fuelEfficiency", efficiency);
                    records.add(rec);
                }
            }

            if (wantsCsv(ctx)) {
                sendCsv(ctx, csv.toString(), "fuel-efficiency-report.csv");
            } else {
                ctx.json(records);
            }

        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    /**
     * GET /reports/fleet-utilization - Utilization of vehicles in active status
     */
    public static void getFleetUtilization(Context ctx) {
        try (Connection conn = DatabaseConfig.getConnection()) {
            int totalVehicles = 0;
            int retiredVehicles = 0;
            int activeVehicles = 0;
            int onTripVehicles = 0;

            String countQuery = "SELECT status, COUNT(*) as cnt FROM vehicles GROUP BY status";
            try (PreparedStatement stmt = conn.prepareStatement(countQuery);
                 ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    String status = rs.getString("status");
                    int count = rs.getInt("cnt");
                    totalVehicles += count;

                    if ("Retired".equalsIgnoreCase(status)) {
                        retiredVehicles += count;
                    } else {
                        activeVehicles += count;
                        if ("On Trip".equalsIgnoreCase(status)) {
                            onTripVehicles += count;
                        }
                    }
                }
            }

            double utilizationRate = 0.0;
            if (activeVehicles > 0) {
                utilizationRate = (onTripVehicles * 100.0) / activeVehicles;
            }

            if (wantsCsv(ctx)) {
                String csv = "Metric,Value\n" +
                             "Total Vehicles," + totalVehicles + "\n" +
                             "Retired Vehicles," + retiredVehicles + "\n" +
                             "Active Vehicles (Non-Retired)," + activeVehicles + "\n" +
                             "On Trip Vehicles," + onTripVehicles + "\n" +
                             "Fleet Utilization (%)," + String.format("%.2f", utilizationRate) + "\n";
                sendCsv(ctx, csv, "fleet-utilization-report.csv");
            } else {
                Map<String, Object> result = new HashMap<>();
                result.put("totalVehicles", totalVehicles);
                result.put("retiredVehicles", retiredVehicles);
                result.put("activeVehicles", activeVehicles);
                result.put("onTripVehicles", onTripVehicles);
                result.put("utilizationRate", utilizationRate);
                ctx.json(result);
            }

        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    /**
     * GET /reports/operational-cost - Operational cost breakdown (Fuel + Maintenance)
     */
    public static void getOperationalCosts(Context ctx) {
        List<Map<String, Object>> records = new ArrayList<>();
        String query = 
            "SELECT v.id, v.registration_number, " +
            "       COALESCE(f.total_fuel_cost, 0.0) AS fuel_cost, " +
            "       COALESCE(e_maint.total_maint_cost, 0.0) AS maintenance_cost, " +
            "       COALESCE(e_other.total_other_cost, 0.0) AS other_cost, " +
            "       (COALESCE(f.total_fuel_cost, 0.0) + COALESCE(e_maint.total_maint_cost, 0.0)) AS total_operational_cost " +
            "FROM vehicles v " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(cost) AS total_fuel_cost " +
            "   FROM fuel_logs " +
            "   GROUP BY vehicle_id" +
            ") f ON v.id = f.vehicle_id " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(amount) AS total_maint_cost " +
            "   FROM expenses " +
            "   WHERE LOWER(type) = 'maintenance' " +
            "   GROUP BY vehicle_id" +
            ") e_maint ON v.id = e_maint.vehicle_id " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(amount) AS total_other_cost " +
            "   FROM expenses " +
            "   WHERE LOWER(type) != 'maintenance' " +
            "   GROUP BY vehicle_id" +
            ") e_other ON v.id = e_other.vehicle_id " +
            "ORDER BY total_operational_cost DESC, v.id ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            StringBuilder csv = new StringBuilder("Vehicle ID,Registration Number,Fuel Cost,Maintenance Cost,Other Expense Cost,Total Operational Cost\n");

            while (rs.next()) {
                int id = rs.getInt("id");
                String reg = rs.getString("registration_number");
                double fuel = rs.getDouble("fuel_cost");
                double maint = rs.getDouble("maintenance_cost");
                double other = rs.getDouble("other_cost");
                double totalOp = rs.getDouble("total_operational_cost");

                if (wantsCsv(ctx)) {
                    csv.append(id).append(",")
                       .append(reg).append(",")
                       .append(String.format("%.2f", fuel)).append(",")
                       .append(String.format("%.2f", maint)).append(",")
                       .append(String.format("%.2f", other)).append(",")
                       .append(String.format("%.2f", totalOp)).append("\n");
                } else {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("vehicleId", id);
                    rec.put("vehicleRegistration", reg);
                    rec.put("fuelCost", fuel);
                    rec.put("maintenanceCost", maint);
                    rec.put("otherCost", other);
                    rec.put("totalOperationalCost", totalOp);
                    records.add(rec);
                }
            }

            if (wantsCsv(ctx)) {
                sendCsv(ctx, csv.toString(), "operational-cost-report.csv");
            } else {
                ctx.json(records);
            }

        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    /**
     * GET /reports/roi - ROI = (Revenue - (Maintenance + Fuel)) / Acquisition Cost
     */
    public static void getRoi(Context ctx) {
        List<Map<String, Object>> records = new ArrayList<>();
        String query = 
            "SELECT v.id, v.registration_number, v.acquisition_cost, " +
            "       COALESCE(t.total_revenue, 0.0) AS revenue, " +
            "       COALESCE(f.total_fuel_cost, 0.0) AS fuel_cost, " +
            "       COALESCE(e_maint.total_maint_cost, 0.0) AS maintenance_cost, " +
            "       CASE WHEN v.acquisition_cost > 0 " +
            "            THEN (COALESCE(t.total_revenue, 0.0) - (COALESCE(f.total_fuel_cost, 0.0) + COALESCE(e_maint.total_maint_cost, 0.0))) / v.acquisition_cost " +
            "            ELSE 0.0 " +
            "       END AS roi " +
            "FROM vehicles v " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(revenue) AS total_revenue " +
            "   FROM trips " +
            "   WHERE status = 'Completed' " +
            "   GROUP BY vehicle_id" +
            ") t ON v.id = t.vehicle_id " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(cost) AS total_fuel_cost " +
            "   FROM fuel_logs " +
            "   GROUP BY vehicle_id" +
            ") f ON v.id = f.vehicle_id " +
            "LEFT JOIN (" +
            "   SELECT vehicle_id, SUM(amount) AS total_maint_cost " +
            "   FROM expenses " +
            "   WHERE LOWER(type) = 'maintenance' " +
            "   GROUP BY vehicle_id" +
            ") e_maint ON v.id = e_maint.vehicle_id " +
            "ORDER BY roi DESC, v.id ASC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query);
             ResultSet rs = stmt.executeQuery()) {

            StringBuilder csv = new StringBuilder("Vehicle ID,Registration Number,Acquisition Cost,Revenue,Fuel Cost,Maintenance Cost,ROI (ratio)\n");

            while (rs.next()) {
                int id = rs.getInt("id");
                String reg = rs.getString("registration_number");
                double acq = rs.getDouble("acquisition_cost");
                double rev = rs.getDouble("revenue");
                double fuel = rs.getDouble("fuel_cost");
                double maint = rs.getDouble("maintenance_cost");
                double roi = rs.getDouble("roi");

                if (wantsCsv(ctx)) {
                    csv.append(id).append(",")
                       .append(reg).append(",")
                       .append(String.format("%.2f", acq)).append(",")
                       .append(String.format("%.2f", rev)).append(",")
                       .append(String.format("%.2f", fuel)).append(",")
                       .append(String.format("%.2f", maint)).append(",")
                       .append(String.format("%.4f", roi)).append("\n");
                } else {
                    Map<String, Object> rec = new HashMap<>();
                    rec.put("vehicleId", id);
                    rec.put("vehicleRegistration", reg);
                    rec.put("acquisitionCost", acq);
                    rec.put("revenue", rev);
                    rec.put("fuelCost", fuel);
                    rec.put("maintenanceCost", maint);
                    rec.put("roi", roi);
                    records.add(rec);
                }
            }

            if (wantsCsv(ctx)) {
                sendCsv(ctx, csv.toString(), "roi-report.csv");
            } else {
                ctx.json(records);
            }

        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Database error: " + e.getMessage()));
        }
    }
}
