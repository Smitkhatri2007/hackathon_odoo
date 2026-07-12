package com.transitops.vehicle;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class VehicleService {
    private final Map<Long, Vehicle> vehicles = new ConcurrentHashMap<>();

    public VehicleService() {
        // Pre-seed vehicle 'Van-05' with ID 1 for testing
        vehicles.put(1L, new Vehicle(1L, "Van-05", 500.0, VehicleStatus.AVAILABLE));
        // Add another mock vehicle
        vehicles.put(2L, new Vehicle(2L, "Truck-12", 2000.0, VehicleStatus.AVAILABLE));
    }

    public Vehicle getById(Long id) {
        Vehicle vehicle = vehicles.get(id);
        if (vehicle == null) {
            throw new IllegalArgumentException("Vehicle not found with ID: " + id);
        }
        return vehicle;
    }

    public boolean isAvailable(Long id) {
        Vehicle vehicle = vehicles.get(id);
        return vehicle != null && vehicle.getStatus() == VehicleStatus.AVAILABLE;
    }

    public void updateStatus(Long id, VehicleStatus status) {
        Vehicle vehicle = vehicles.get(id);
        if (vehicle != null) {
            vehicle.setStatus(status);
        }
    }

    public List<Vehicle> getAvailableVehicles() {
        List<Vehicle> available = new ArrayList<>();
        for (Vehicle v : vehicles.values()) {
            if (v.getStatus() == VehicleStatus.AVAILABLE) {
                available.add(v);
            }
        }
        return available;
    }

    // Helper for test/setup
    public void registerVehicle(Vehicle vehicle) {
        vehicles.put(vehicle.getId(), vehicle);
    }
}
