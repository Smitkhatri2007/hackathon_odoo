package com.transitops.controller;

import com.transitops.config.DatabaseConfig;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.NotFoundResponse;

import java.sql.*;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class MaintenanceController {

    // DTO for incoming creation requests
    public static class CreateMaintenanceRequest {
        public Integer vehicleId;
        public String description;
        public String date; // Expected format: YYYY-MM-DD
    }

    /**
     * GET /maintenance - List maintenance records, filterable by vehicleId
     */
    public static void list(Context ctx) {
        String vehicleIdParam = ctx.queryParam("vehicleId");
        List<Map<String, Object>> logs = new ArrayList<>();

        String query = "SELECT m.id, m.vehicle_id, m.description, m.date, m.status, v.registration_number " +
                       "FROM maintenance_logs m " +
                       "JOIN vehicles v ON m.vehicle_id = v.id ";
        
        if (vehicleIdParam != null && !vehicleIdParam.trim().isEmpty()) {
            query += "WHERE m.vehicle_id = ? ";
        }
        query += "ORDER BY m.date DESC, m.id DESC";

        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            
            if (vehicleIdParam != null && !vehicleIdParam.trim().isEmpty()) {
                try {
                    stmt.setInt(1, Integer.parseInt(vehicleIdParam));
                } catch (NumberFormatException e) {
                    throw new BadRequestResponse("Invalid vehicleId parameter format.");
                }
            }

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    Map<String, Object> log = new HashMap<>();
                    log.put("id", rs.getInt("id"));
                    log.put("vehicleId", rs.getInt("vehicle_id"));
                    log.put("vehicleRegistration", rs.getString("registration_number"));
                    log.put("description", rs.getString("description"));
                    log.put("date", rs.getDate("date").toString());
                    log.put("status", rs.getString("status"));
                    logs.add(log);
                }
            }
            ctx.json(logs);
        } catch (SQLException e) {
            ctx.status(HttpStatus.INTERNAL_SERVER_ERROR).json(Map.of("error", "Database error: " + e.getMessage()));
        }
    }

    /**
     * POST /maintenance - Create active maintenance record & change vehicle status to 'In Shop'
     */
    public static void create(Context ctx) {
        CreateMaintenanceRequest req;
        try {
            req = ctx.bodyAsClass(CreateMaintenanceRequest.class);
        } catch (Exception e) {
            throw new BadRequestResponse("Invalid request body format.");
        }

        if (req.vehicleId == null || req.description == null || req.description.trim().isEmpty() || req.date == null) {
            throw new BadRequestResponse("Missing required fields: vehicleId, description, and date are required.");
        }

        // Validate date format
        Date sqlDate;
        try {
            sqlDate = Date.valueOf(req.date);
        } catch (IllegalArgumentException e) {
            throw new BadRequestResponse("Invalid date format. Expected YYYY-MM-DD.");
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);
            
            // 1. Verify vehicle exists and get its current status
            String vehicleQuery = "SELECT status, registration_number FROM vehicles WHERE id = ?";
            String vehicleStatus = null;
            String vehicleReg = null;
            
            try (PreparedStatement stmt = conn.prepareStatement(vehicleQuery)) {
                stmt.setInt(1, req.vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        vehicleStatus = rs.getString("status");
                        vehicleReg = rs.getString("registration_number");
                    }
                }
            }

            if (vehicleStatus == null) {
                conn.rollback();
                throw new NotFoundResponse("Vehicle with ID " + req.vehicleId + " not found.");
            }

            if ("Retired".equalsIgnoreCase(vehicleStatus)) {
                conn.rollback();
                throw new BadRequestResponse("Vehicle is Retired and cannot undergo maintenance.");
            }

            // 2. Insert maintenance log
            int logId = -1;
            String insertLog = "INSERT INTO maintenance_logs (vehicle_id, description, date, status) VALUES (?, ?, ?, 'Active')";
            try (PreparedStatement stmt = conn.prepareStatement(insertLog, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, req.vehicleId);
                stmt.setString(2, req.description);
                stmt.setDate(3, sqlDate);
                stmt.executeUpdate();
                
                try (ResultSet generatedKeys = stmt.getGeneratedKeys()) {
                    if (generatedKeys.next()) {
                        logId = generatedKeys.getInt(1);
                    }
                }
            }

            // 3. Update vehicle status to 'In Shop'
            String updateVehicle = "UPDATE vehicles SET status = 'In Shop' WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(updateVehicle)) {
                stmt.setInt(1, req.vehicleId);
                stmt.executeUpdate();
            }

            conn.commit();

            // Return created log object
            Map<String, Object> result = new HashMap<>();
            result.put("id", logId);
            result.put("vehicleId", req.vehicleId);
            result.put("vehicleRegistration", vehicleReg);
            result.put("description", req.description);
            result.put("date", req.date);
            result.put("status", "Active");

            ctx.status(HttpStatus.CREATED).json(result);

        } catch (SQLException e) {
            throw new RuntimeException("Database operation failed", e);
        }
    }

    /**
     * PATCH /maintenance/:id/close - Close maintenance log & restore vehicle status to 'Available' (unless Retired)
     */
    public static void close(Context ctx) {
        String idParam = ctx.pathParam("id");
        int logId;
        try {
            logId = Integer.parseInt(idParam);
        } catch (NumberFormatException e) {
            throw new BadRequestResponse("Invalid maintenance log ID format.");
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            conn.setAutoCommit(false);

            // 1. Fetch maintenance log details
            int vehicleId = -1;
            String logStatus = null;
            String description = null;
            Date date = null;
            
            String logQuery = "SELECT vehicle_id, description, date, status FROM maintenance_logs WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(logQuery)) {
                stmt.setInt(1, logId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        vehicleId = rs.getInt("vehicle_id");
                        description = rs.getString("description");
                        date = rs.getDate("date");
                        logStatus = rs.getString("status");
                    }
                }
            }

            if (vehicleId == -1) {
                conn.rollback();
                throw new NotFoundResponse("Maintenance log with ID " + logId + " not found.");
            }

            // 2. Fetch vehicle status
            String vehicleStatus = null;
            String vehicleReg = null;
            String vehicleQuery = "SELECT status, registration_number FROM vehicles WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(vehicleQuery)) {
                stmt.setInt(1, vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        vehicleStatus = rs.getString("status");
                        vehicleReg = rs.getString("registration_number");
                    }
                }
            }

            // 3. Update maintenance log status to 'Closed'
            String updateLog = "UPDATE maintenance_logs SET status = 'Closed' WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(updateLog)) {
                stmt.setInt(1, logId);
                stmt.executeUpdate();
            }

            // 4. Update vehicle status to 'Available' (unless Retired)
            if (vehicleStatus != null && !"Retired".equalsIgnoreCase(vehicleStatus)) {
                String updateVehicle = "UPDATE vehicles SET status = 'Available' WHERE id = ?";
                try (PreparedStatement stmt = conn.prepareStatement(updateVehicle)) {
                    stmt.setInt(1, vehicleId);
                    stmt.executeUpdate();
                }
            }

            conn.commit();

            Map<String, Object> result = new HashMap<>();
            result.put("id", logId);
            result.put("vehicleId", vehicleId);
            result.put("vehicleRegistration", vehicleReg);
            result.put("description", description);
            result.put("date", date != null ? date.toString() : null);
            result.put("status", "Closed");

            ctx.status(HttpStatus.OK).json(result);

        } catch (SQLException e) {
            throw new RuntimeException("Database operation failed", e);
        }
    }
}
