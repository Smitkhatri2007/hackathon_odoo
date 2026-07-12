package com.transitops.dashboard;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.LinkedHashMap;
import java.util.Map;

/**
 * DashboardController — REST endpoints for the dashboard KPIs and chart data.
 *
 * Endpoints:
 *   GET /api/dashboard/kpis           → 7 KPI metrics + chart breakdowns
 *   GET /api/dashboard/kpis?type=BUS  → filtered by vehicle type
 *   GET /api/dashboard/kpis?status=AVAILABLE → filtered by vehicle status
 */
@RestController
@RequestMapping("/api/dashboard")
@CrossOrigin(origins = "http://localhost:5173")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    /**
     * GET /api/dashboard/kpis
     *
     * Returns all 7 KPI metrics plus vehicle/trip status breakdowns for charts.
     * Supports optional query params:
     *   ?type=<vehicleType>  — filters vehicle counts by type (e.g., TRUCK, BUS)
     *   ?status=<status>     — filters vehicle counts by status
     *
     * Response shape:
     * {
     *   "success": true,
     *   "message": "Dashboard KPIs fetched successfully",
     *   "data": {
     *     "kpis": { activeVehicles, availableVehicles, ... },
     *     "vehicleStatusBreakdown": { "AVAILABLE": 5, ... },
     *     "tripStatusBreakdown": { "DRAFT": 2, ... }
     *   }
     * }
     */
    @GetMapping("/kpis")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getKpis(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status) {

        Map<String, Object> data = new LinkedHashMap<>();
        data.put("kpis", dashboardService.getKpis(type, status));
        data.put("vehicleStatusBreakdown", dashboardService.getVehicleStatusBreakdown());
        data.put("tripStatusBreakdown", dashboardService.getTripStatusBreakdown());

        return ResponseEntity.ok(
                ApiResponse.ok("Dashboard KPIs fetched successfully", data));
    }
}
