package com.transitops.maintenance.dto;

import com.transitops.maintenance.MaintenanceLog;
import com.transitops.maintenance.MaintenanceStatus;

import java.time.LocalDateTime;

public class MaintenanceResponse {

    private Long id;
    private Long vehicleId;
    private String type;
    private String description;
    private Double cost;
    private MaintenanceStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime closedAt;

    public static MaintenanceResponse from(MaintenanceLog log) {
        MaintenanceResponse r = new MaintenanceResponse();
        r.id = log.getId();
        r.vehicleId = log.getVehicleId();
        r.type = log.getType();
        r.description = log.getDescription();
        r.cost = log.getCost();
        r.status = log.getStatus();
        r.createdAt = log.getCreatedAt();
        r.closedAt = log.getClosedAt();
        return r;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public Long getVehicleId() {
        return vehicleId;
    }

    public String getType() {
        return type;
    }

    public String getDescription() {
        return description;
    }

    public Double getCost() {
        return cost;
    }

    public MaintenanceStatus getStatus() {
        return status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getClosedAt() {
        return closedAt;
    }
}
