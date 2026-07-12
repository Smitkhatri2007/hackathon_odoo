package com.transitops.maintenance;

import com.transitops.common.ApiResponse;
import com.transitops.maintenance.dto.MaintenanceRequest;
import com.transitops.maintenance.dto.MaintenanceResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceController {

    private final MaintenanceService maintenanceService;

    public MaintenanceController(MaintenanceService maintenanceService) {
        this.maintenanceService = maintenanceService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<MaintenanceResponse>> create(@RequestBody MaintenanceRequest request) {
        MaintenanceResponse response = maintenanceService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Maintenance record created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getAll() {
        List<MaintenanceResponse> list = maintenanceService.getAll();
        return ResponseEntity.ok(ApiResponse.ok("Maintenance records retrieved", list));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<MaintenanceResponse>>> getByVehicleId(@PathVariable Long vehicleId) {
        List<MaintenanceResponse> list = maintenanceService.getByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok("Maintenance records for vehicle " + vehicleId, list));
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<ApiResponse<MaintenanceResponse>> close(@PathVariable Long id) {
        MaintenanceResponse response = maintenanceService.close(id);
        return ResponseEntity.ok(ApiResponse.ok("Maintenance record closed", response));
    }
}
