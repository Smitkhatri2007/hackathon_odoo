package com.transitops.vehicle;

import org.springframework.stereotype.Service;

/**
 * Stub VehicleService — Person 1 owns this file and will replace it.
 * Person 3 (Maintenance) injects this to update vehicle status on maintenance
 * open/close.
 */
@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vehicle not found with id: " + id));
    }

    public boolean isAvailable(Long id) {
        Vehicle vehicle = getById(id);
        return vehicle.getStatus() == VehicleStatus.AVAILABLE;
    }

    public void updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = getById(id);
        vehicle.setStatus(status);
        vehicleRepository.save(vehicle);
    }
}
