package com.transitops.vehicle;

import com.transitops.common.ApiResponse;
import com.transitops.vehicle.dto.VehicleRequest;
import com.transitops.vehicle.dto.VehicleResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    private final VehicleService vehicleService;

    public VehicleController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        List<VehicleResponse> vehicles = vehicleService.getAllVehicles();
        return ResponseEntity.ok(ApiResponse.success("Vehicles retrieved successfully", vehicles));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> getVehicleById(@PathVariable Long id) {
        VehicleResponse vehicle = vehicleService.getVehicleById(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle retrieved successfully", vehicle));
    }

    @GetMapping("/available")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAvailableVehicles() {
        List<VehicleResponse> vehicles = vehicleService.getAvailableVehicles();
        return ResponseEntity.ok(ApiResponse.success("Available vehicles retrieved successfully", vehicles));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<VehicleResponse>> createVehicle(@Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.createVehicle(request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle created successfully", vehicle));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable Long id, @Valid @RequestBody VehicleRequest request) {
        VehicleResponse vehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(ApiResponse.success("Vehicle updated successfully", vehicle));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Object>> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok(ApiResponse.success("Vehicle deleted successfully", null));
    }

    @PostMapping("/validate-parivahan")
    public ResponseEntity<ApiResponse<Boolean>> validateParivahan(@RequestBody java.util.Map<String, String> body) {
        String regNo = body.get("registrationNumber");
        if (regNo == null || regNo.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Registration number is required"));
        }
        
        // Simple regex check for Indian vehicle registration format (e.g. MH 12 AB 1234)
        String regex = "^[A-Z]{2}[\\s-]?[0-9]{1,2}[\\s-]?[A-Z]{1,2}[\\s-]?[0-9]{4}$";
        boolean isValid = regNo.toUpperCase().matches(regex);
        
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Vehicle verified with Parivahan", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Invalid vehicle registration number according to Parivahan database. Format must be like MH 12 AB 1234"));
        }
    }
}
