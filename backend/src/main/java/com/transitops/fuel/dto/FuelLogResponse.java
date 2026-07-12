package com.transitops.fuel.dto;

import com.transitops.fuel.FuelLog;

import java.time.LocalDate;

public class FuelLogResponse {

    private Long id;
    private Long vehicleId;
    private Double liters;
    private Double cost;
    private LocalDate logDate;

    public static FuelLogResponse from(FuelLog log) {
        FuelLogResponse r = new FuelLogResponse();
        r.id = log.getId();
        r.vehicleId = log.getVehicleId();
        r.liters = log.getLiters();
        r.cost = log.getCost();
        r.logDate = log.getLogDate();
        return r;
    }

    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public Double getLiters() {
        return liters;
    }

    public Double getCost() {
        return cost;
    }

    public LocalDate getLogDate() {
        return logDate;
    }
}
