package com.transitops.expense.dto;

public class CostSummaryResponse {

    private Long vehicleId;
    private Double totalFuelCost;
    private Double totalMaintenanceCost;
    private Double totalOperationalCost;

    public CostSummaryResponse(Long vehicleId, Double totalFuelCost, Double totalMaintenanceCost) {
        this.vehicleId = vehicleId;
        this.totalFuelCost = totalFuelCost;
        this.totalMaintenanceCost = totalMaintenanceCost;
        this.totalOperationalCost = totalFuelCost + totalMaintenanceCost;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public Double getTotalFuelCost() {
        return totalFuelCost;
    }

    public Double getTotalMaintenanceCost() {
        return totalMaintenanceCost;
    }

    public Double getTotalOperationalCost() {
        return totalOperationalCost;
    }
}
