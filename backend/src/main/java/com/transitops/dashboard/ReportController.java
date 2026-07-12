package com.transitops.dashboard;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * ReportController — REST endpoints for fleet reports and analytics.
 *
 * Endpoints:
 *   GET /api/reports/fuel-efficiency    → per-vehicle km/L from completed trips
 *   GET /api/reports/fleet-utilization  → ON_TRIP vs total non-RETIRED vehicles
 *   GET /api/reports/operational-cost   → per-vehicle maintenance + fuel cost
 *   GET /api/reports/vehicle-roi        → bonus: per-vehicle ROI percentage
 */
@RestController
@RequestMapping("/api/reports")
@CrossOrigin(origins = "http://localhost:5173")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    /**
     * GET /api/reports/fuel-efficiency
     * Per-vehicle fuel efficiency: SUM(actual_distance) / SUM(fuel_consumed)
     */
    @GetMapping("/fuel-efficiency")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getFuelEfficiency() {
        List<Map<String, Object>> data = reportService.getFuelEfficiency();
        return ResponseEntity.ok(
                ApiResponse.ok("Fuel efficiency report fetched successfully", data));
    }

    /**
     * GET /api/reports/fleet-utilization
     * Percentage of vehicles currently ON_TRIP vs total non-RETIRED vehicles.
     */
    @GetMapping("/fleet-utilization")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getFleetUtilization() {
        Map<String, Object> data = reportService.getFleetUtilization();
        return ResponseEntity.ok(
                ApiResponse.ok("Fleet utilization report fetched successfully", data));
    }

    /**
     * GET /api/reports/operational-cost
     * Per-vehicle operational cost: SUM(maintenance) + SUM(fuel).
     */
    @GetMapping("/operational-cost")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getOperationalCost() {
        List<Map<String, Object>> data = reportService.getOperationalCost();
        return ResponseEntity.ok(
                ApiResponse.ok("Operational cost report fetched successfully", data));
    }

    /**
     * GET /api/reports/vehicle-roi?revenue=50000
     * Per-vehicle ROI. If trips.revenue column exists, uses it.
     * Otherwise, accepts a manual revenue figure via query param.
     */
    @GetMapping("/vehicle-roi")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getVehicleRoi(
            @RequestParam(required = false) Double revenue) {
        List<Map<String, Object>> data = reportService.getVehicleRoi(revenue);
        return ResponseEntity.ok(
                ApiResponse.ok("Vehicle ROI report fetched successfully", data));
    }
}
