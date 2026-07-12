package com.transitops.controller;

import com.transitops.config.DatabaseConfig;
import io.javalin.http.Context;
import io.javalin.http.HttpStatus;
import io.javalin.http.BadRequestResponse;
import io.javalin.http.NotFoundResponse;

import java.sql.*;
import java.util.HashMap;
import java.util.Map;

public class FuelExpenseController {

    // DTO for Fuel Log requests
    public static class CreateFuelLogRequest {
        public Integer vehicleId;
        public Double liters;
        public Double cost;
        public String date; // YYYY-MM-DD
    }

    // DTO for Expense requests
    public static class CreateExpenseRequest {
        public Integer vehicleId;
        public String type; // e.g. Toll, Maintenance, Insurance, etc.
        public Double amount;
        public String date; // YYYY-MM-DD
    }

    /**
     * POST /fuel-logs - Record fuel logs (liters, cost, date) for a vehicle
     */
    public static void createFuelLog(Context ctx) {
        CreateFuelLogRequest req;
        try {
            req = ctx.bodyAsClass(CreateFuelLogRequest.class);
        } catch (Exception e) {
            throw new BadRequestResponse("Invalid request body format.");
        }

        if (req.vehicleId == null || req.liters == null || req.cost == null || req.date == null) {
            throw new BadRequestResponse("Missing required fields: vehicleId, liters, cost, and date are required.");
        }

        if (req.liters <= 0 || req.cost <= 0) {
            throw new BadRequestResponse("Liters and cost must be positive numbers.");
        }

        Date sqlDate;
        try {
            sqlDate = Date.valueOf(req.date);
        } catch (IllegalArgumentException e) {
            throw new BadRequestResponse("Invalid date format. Expected YYYY-MM-DD.");
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Check vehicle exists
            String checkVehicle = "SELECT id FROM vehicles WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(checkVehicle)) {
                stmt.setInt(1, req.vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) {
                        throw new NotFoundResponse("Vehicle with ID " + req.vehicleId + " not found.");
                    }
                }
            }

            int logId = -1;
            String insertQuery = "INSERT INTO fuel_logs (vehicle_id, liters, cost, date) VALUES (?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, req.vehicleId);
                stmt.setDouble(2, req.liters);
                stmt.setDouble(3, req.cost);
                stmt.setDate(4, sqlDate);
                stmt.executeUpdate();

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        logId = rs.getInt(1);
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("id", logId);
            result.put("vehicleId", req.vehicleId);
            result.put("liters", req.liters);
            result.put("cost", req.cost);
            result.put("date", req.date);

            ctx.status(HttpStatus.CREATED).json(result);

        } catch (SQLException e) {
            throw new RuntimeException("Database operation failed", e);
        }
    }

    /**
     * POST /expenses - Record expenses (tolls, maintenance, etc.) for a vehicle
     */
    public static void createExpense(Context ctx) {
        CreateExpenseRequest req;
        try {
            req = ctx.bodyAsClass(CreateExpenseRequest.class);
        } catch (Exception e) {
            throw new BadRequestResponse("Invalid request body format.");
        }

        if (req.vehicleId == null || req.type == null || req.type.trim().isEmpty() || req.amount == null || req.date == null) {
            throw new BadRequestResponse("Missing required fields: vehicleId, type, amount, and date are required.");
        }

        if (req.amount <= 0) {
            throw new BadRequestResponse("Amount must be a positive number.");
        }

        Date sqlDate;
        try {
            sqlDate = Date.valueOf(req.date);
        } catch (IllegalArgumentException e) {
            throw new BadRequestResponse("Invalid date format. Expected YYYY-MM-DD.");
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Check vehicle exists
            String checkVehicle = "SELECT id FROM vehicles WHERE id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(checkVehicle)) {
                stmt.setInt(1, req.vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (!rs.next()) {
                        throw new NotFoundResponse("Vehicle with ID " + req.vehicleId + " not found.");
                    }
                }
            }

            int expenseId = -1;
            String insertQuery = "INSERT INTO expenses (vehicle_id, type, amount, date) VALUES (?, ?, ?, ?)";
            try (PreparedStatement stmt = conn.prepareStatement(insertQuery, Statement.RETURN_GENERATED_KEYS)) {
                stmt.setInt(1, req.vehicleId);
                stmt.setString(2, req.type.trim());
                stmt.setDouble(3, req.amount);
                stmt.setDate(4, sqlDate);
                stmt.executeUpdate();

                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    if (rs.next()) {
                        expenseId = rs.getInt(1);
                    }
                }
            }

            Map<String, Object> result = new HashMap<>();
            result.put("id", expenseId);
            result.put("vehicleId", req.vehicleId);
            result.put("type", req.type.trim());
            result.put("amount", req.amount);
            result.put("date", req.date);

            ctx.status(HttpStatus.CREATED).json(result);

        } catch (SQLException e) {
            throw new RuntimeException("Database operation failed", e);
        }
    }

    /**
     * GET /vehicles/:id/costs - Return total operational cost = sum of fuel cost + maintenance cost for that vehicle
     */
    public static void getOperationalCosts(Context ctx) {
        String idParam = ctx.pathParam("id");
        int vehicleId;
        try {
            vehicleId = Integer.parseInt(idParam);
        } catch (NumberFormatException e) {
            throw new BadRequestResponse("Invalid vehicle ID format.");
        }

        try (Connection conn = DatabaseConfig.getConnection()) {
            // Check vehicle exists
            String checkVehicle = "SELECT registration_number FROM vehicles WHERE id = ?";
            String registrationNumber = null;
            try (PreparedStatement stmt = conn.prepareStatement(checkVehicle)) {
                stmt.setInt(1, vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        registrationNumber = rs.getString("registration_number");
                    }
                }
            }

            if (registrationNumber == null) {
                throw new NotFoundResponse("Vehicle with ID " + vehicleId + " not found.");
            }

            double fuelCost = 0.0;
            double maintenanceCost = 0.0;
            double otherCost = 0.0;

            // 1. Sum fuel costs
            String fuelQuery = "SELECT COALESCE(SUM(cost), 0.0) FROM fuel_logs WHERE vehicle_id = ?";
            try (PreparedStatement stmt = conn.prepareStatement(fuelQuery)) {
                stmt.setInt(1, vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        fuelCost = rs.getDouble(1);
                    }
                }
            }

            // 2. Sum maintenance expenses
            String maintenanceQuery = "SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE vehicle_id = ? AND LOWER(type) = 'maintenance'";
            try (PreparedStatement stmt = conn.prepareStatement(maintenanceQuery)) {
                stmt.setInt(1, vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        maintenanceCost = rs.getDouble(1);
                    }
                }
            }

            // 3. Sum other expenses (tolls, insurance, etc.)
            String otherExpensesQuery = "SELECT COALESCE(SUM(amount), 0.0) FROM expenses WHERE vehicle_id = ? AND LOWER(type) != 'maintenance'";
            try (PreparedStatement stmt = conn.prepareStatement(otherExpensesQuery)) {
                stmt.setInt(1, vehicleId);
                try (ResultSet rs = stmt.executeQuery()) {
                    if (rs.next()) {
                        otherCost = rs.getDouble(1);
                    }
                }
            }

            // Operational Cost = Fuel + Maintenance
            double totalOperationalCost = fuelCost + maintenanceCost;

            Map<String, Object> result = new HashMap<>();
            result.put("vehicleId", vehicleId);
            result.put("vehicleRegistration", registrationNumber);
            result.put("fuelCost", fuelCost);
            result.put("maintenanceCost", maintenanceCost);
            result.put("otherCost", otherCost);
            result.put("totalOperationalCost", totalOperationalCost);

            ctx.json(result);

        } catch (SQLException e) {
            throw new RuntimeException("Database operation failed", e);
        }
    }
}
