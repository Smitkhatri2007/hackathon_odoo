package com.transitops;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.transitops.config.DatabaseConfig;
import io.javalin.Javalin;
import org.junit.jupiter.api.*;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.sql.Connection;
import java.sql.PreparedStatement;
import java.sql.ResultSet;
import java.sql.SQLException;

import static org.junit.jupiter.api.Assertions.*;

@TestInstance(TestInstance.Lifecycle.PER_CLASS)
public class MaintenanceApiTest {

    private Javalin app;
    private int port;
    private HttpClient client;
    private ObjectMapper mapper;
    private String baseUrl;

    @BeforeAll
    public void setUp() {
        // Start Javalin on an ephemeral port
        app = App.startServer(0);
        port = app.port();
        baseUrl = "http://localhost:" + port;
        client = HttpClient.newHttpClient();
        mapper = new ObjectMapper();
    }

    @AfterAll
    public void tearDown() {
        app.stop();
        DatabaseConfig.close();
    }

    @BeforeEach
    public void resetDatabase() throws SQLException {
        // Clear/reset data to a known state before each test
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt1 = conn.prepareStatement("DELETE FROM maintenance_logs");
             PreparedStatement stmt2 = conn.prepareStatement("DELETE FROM trips");
             PreparedStatement stmt3 = conn.prepareStatement("DELETE FROM fuel_logs");
             PreparedStatement stmt4 = conn.prepareStatement("DELETE FROM expenses");
             PreparedStatement stmt5 = conn.prepareStatement("DELETE FROM vehicles")) {
            
            stmt1.executeUpdate();
            stmt2.executeUpdate();
            stmt3.executeUpdate();
            stmt4.executeUpdate();
            stmt5.executeUpdate();

            // Re-insert test vehicles
            String insertVehicles = "INSERT INTO vehicles (id, registration_number, model, type, max_load_capacity, odometer, acquisition_cost, status) VALUES " +
                    "(1, 'TRK-101', 'Volvo Test', 'Truck', 20000.0, 1000.0, 80000.0, 'Available')," +
                    "(2, 'VAN-102', 'Ford Test', 'Van', 3000.0, 500.0, 35000.0, 'Retired')";
            try (PreparedStatement stmtInsert = conn.prepareStatement(insertVehicles)) {
                stmtInsert.executeUpdate();
            }
        }
    }

    private String getVehicleStatus(int vehicleId) throws SQLException {
        try (Connection conn = DatabaseConfig.getConnection();
             PreparedStatement stmt = conn.prepareStatement("SELECT status FROM vehicles WHERE id = ?")) {
            stmt.setInt(1, vehicleId);
            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    return rs.getString("status");
                }
            }
        }
        return null;
    }

    @Test
    public void testCreateMaintenanceAndAutoStatusChange() throws IOException, InterruptedException, SQLException {
        // Verify initially vehicle is Available
        assertEquals("Available", getVehicleStatus(1));

        String requestBody = "{\"vehicleId\": 1, \"description\": \"Annual Service\", \"date\": \"2026-07-12\"}";

        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

        assertEquals(201, response.statusCode());

        JsonNode jsonNode = mapper.readTree(response.body());
        assertTrue(jsonNode.has("id"));
        assertEquals(1, jsonNode.get("vehicleId").asInt());
        assertEquals("Active", jsonNode.get("status").asText());

        // Verify vehicle status has changed to 'In Shop' in the database
        assertEquals("In Shop", getVehicleStatus(1));
    }

    @Test
    public void testCloseMaintenanceAndAutoStatusRestore() throws IOException, InterruptedException, SQLException {
        // 1. Create an active maintenance log first
        String createBody = "{\"vehicleId\": 1, \"description\": \"Oil Filter Change\", \"date\": \"2026-07-12\"}";
        HttpRequest createReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(createBody))
                .build();
        HttpResponse<String> createRes = client.send(createReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(201, createRes.statusCode());
        JsonNode createJson = mapper.readTree(createRes.body());
        int logId = createJson.get("id").asInt();

        assertEquals("In Shop", getVehicleStatus(1));

        // 2. Close the maintenance log
        HttpRequest closeReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance/" + logId + "/close"))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> closeRes = client.send(closeReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, closeRes.statusCode());

        JsonNode closeJson = mapper.readTree(closeRes.body());
        assertEquals("Closed", closeJson.get("status").asText());

        // Verify vehicle status is restored to Available in the database
        assertEquals("Available", getVehicleStatus(1));
    }

    @Test
    public void testCloseMaintenanceForRetiredVehicleDoesNotRestoreAvailable() throws IOException, InterruptedException, SQLException {
        // Manually insert active maintenance for a Retired vehicle
        int logId;
        try (Connection conn = DatabaseConfig.getConnection()) {
            // First, make vehicle 1 status = 'Retired'
            try (PreparedStatement stmt = conn.prepareStatement("UPDATE vehicles SET status = 'Retired' WHERE id = 1")) {
                stmt.executeUpdate();
            }
            
            // Insert active maintenance log
            try (PreparedStatement stmt = conn.prepareStatement(
                    "INSERT INTO maintenance_logs (vehicle_id, description, date, status) VALUES (1, 'Final Check', '2026-07-12', 'Active')",
                    PreparedStatement.RETURN_GENERATED_KEYS)) {
                stmt.executeUpdate();
                try (ResultSet rs = stmt.getGeneratedKeys()) {
                    rs.next();
                    logId = rs.getInt(1);
                }
            }
        }

        assertEquals("Retired", getVehicleStatus(1));

        // Close the maintenance
        HttpRequest closeReq = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance/" + logId + "/close"))
                .header("Content-Type", "application/json")
                .method("PATCH", HttpRequest.BodyPublishers.noBody())
                .build();
        HttpResponse<String> closeRes = client.send(closeReq, HttpResponse.BodyHandlers.ofString());
        assertEquals(200, closeRes.statusCode());

        // Verify vehicle status remains Retired
        assertEquals("Retired", getVehicleStatus(1));
    }

    @Test
    public void testCreateMaintenanceForNonExistentVehicleReturnsNotFound() throws IOException, InterruptedException {
        String requestBody = "{\"vehicleId\": 999, \"description\": \"Non-existent check\", \"date\": \"2026-07-12\"}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        assertEquals(404, response.statusCode());
        assertTrue(response.body().contains("Vehicle with ID 999 not found"));
    }

    @Test
    public void testCreateMaintenanceForRetiredVehicleReturnsBadRequest() throws IOException, InterruptedException {
        // Vehicle ID 2 is Retired
        String requestBody = "{\"vehicleId\": 2, \"description\": \"Retired vehicle check\", \"date\": \"2026-07-12\"}";
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + "/maintenance"))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                .build();

        HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());
        assertEquals(400, response.statusCode());
        assertTrue(response.body().contains("Vehicle is Retired and cannot undergo maintenance"));
    }
}
