package com.transitops.fuel;

import com.transitops.common.ApiResponse;
import com.transitops.fuel.dto.FuelLogRequest;
import com.transitops.fuel.dto.FuelLogResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel-logs")
public class FuelLogController {

    private final FuelLogService fuelLogService;

    public FuelLogController(FuelLogService fuelLogService) {
        this.fuelLogService = fuelLogService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FuelLogResponse>> create(@RequestBody FuelLogRequest request) {
        FuelLogResponse response = fuelLogService.create(request);
        return ResponseEntity.ok(ApiResponse.ok("Fuel log created", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<FuelLogResponse>>> getAll() {
        List<FuelLogResponse> list = fuelLogService.getAll();
        return ResponseEntity.ok(ApiResponse.ok("Fuel logs retrieved", list));
    }

    @GetMapping("/vehicle/{vehicleId}")
    public ResponseEntity<ApiResponse<List<FuelLogResponse>>> getByVehicleId(@PathVariable Long vehicleId) {
        List<FuelLogResponse> list = fuelLogService.getByVehicleId(vehicleId);
        return ResponseEntity.ok(ApiResponse.ok("Fuel logs for vehicle " + vehicleId, list));
    }
}
