package com.transitops.maintenance;

import com.transitops.maintenance.dto.MaintenanceRequest;
import com.transitops.maintenance.dto.MaintenanceResponse;
import com.transitops.vehicle.Vehicle;
import com.transitops.vehicle.VehicleService;
import com.transitops.vehicle.VehicleStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class MaintenanceService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleService vehicleService;

    public MaintenanceService(MaintenanceLogRepository maintenanceLogRepository,
            VehicleService vehicleService) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleService = vehicleService;
    }

    /**
     * Create a new maintenance record with status OPEN.
     * Automatically sets the vehicle status to IN_SHOP.
     */
    @Transactional
    public MaintenanceResponse create(MaintenanceRequest request) {
        MaintenanceLog log = new MaintenanceLog();
        log.setVehicleId(request.getVehicleId());
        log.setType(request.getType());
        log.setDescription(request.getDescription());
        log.setCost(request.getCost());
        log.setStatus(MaintenanceStatus.OPEN);

        MaintenanceLog saved = maintenanceLogRepository.save(log);

        // Business rule: opening maintenance → vehicle goes to IN_SHOP
        vehicleService.updateStatus(request.getVehicleId(), VehicleStatus.IN_SHOP);

        return MaintenanceResponse.from(saved);
    }

    public List<MaintenanceResponse> getAll() {
        return maintenanceLogRepository.findAll()
                .stream()
                .map(MaintenanceResponse::from)
                .collect(Collectors.toList());
    }

    public List<MaintenanceResponse> getByVehicleId(Long vehicleId) {
        return maintenanceLogRepository.findByVehicleIdOrderByCreatedAtDesc(vehicleId)
                .stream()
                .map(MaintenanceResponse::from)
                .collect(Collectors.toList());
    }

    /**
     * Close a maintenance record:
     * 1. Set status to CLOSED, set closed_at to now
     * 2. Set vehicle status to AVAILABLE — UNLESS current vehicle status is RETIRED
     */
    @Transactional
    public MaintenanceResponse close(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Maintenance record not found with id: " + id));

        if (log.getStatus() == MaintenanceStatus.CLOSED) {
            throw new RuntimeException("Maintenance record is already closed");
        }

        log.setStatus(MaintenanceStatus.CLOSED);
        log.setClosedAt(LocalDateTime.now());
        MaintenanceLog saved = maintenanceLogRepository.save(log);

        // Business rule: restore vehicle to AVAILABLE unless it's RETIRED
        Vehicle vehicle = vehicleService.getById(log.getVehicleId());
        if (vehicle.getStatus() != VehicleStatus.RETIRED) {
            vehicleService.updateStatus(log.getVehicleId(), VehicleStatus.AVAILABLE);
        }

        return MaintenanceResponse.from(saved);
    }

    /**
     * Used by the cost-summary endpoint.
     */
    public Double getTotalMaintenanceCost(Long vehicleId) {
        return maintenanceLogRepository.getTotalMaintenanceCostByVehicleId(vehicleId);
    }
}
