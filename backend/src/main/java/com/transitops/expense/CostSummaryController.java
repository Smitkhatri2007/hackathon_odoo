package com.transitops.expense;

import com.transitops.common.ApiResponse;
import com.transitops.expense.dto.CostSummaryResponse;
import com.transitops.fuel.FuelLogService;
import com.transitops.maintenance.MaintenanceService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/vehicles")
public class CostSummaryController {

    private final FuelLogService fuelLogService;
    private final MaintenanceService maintenanceService;

    public CostSummaryController(FuelLogService fuelLogService, MaintenanceService maintenanceService) {
        this.fuelLogService = fuelLogService;
        this.maintenanceService = maintenanceService;
    }

    @GetMapping("/{vehicleId}/cost-summary")
    public ResponseEntity<ApiResponse<CostSummaryResponse>> getCostSummary(@PathVariable Long vehicleId) {
        Double totalFuelCost = fuelLogService.getTotalFuelCost(vehicleId);
        Double totalMaintenanceCost = maintenanceService.getTotalMaintenanceCost(vehicleId);

        CostSummaryResponse summary = new CostSummaryResponse(vehicleId, totalFuelCost, totalMaintenanceCost);
        return ResponseEntity.ok(ApiResponse.ok("Cost summary for vehicle " + vehicleId, summary));
    }
}
