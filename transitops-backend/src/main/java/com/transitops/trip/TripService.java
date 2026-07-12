package com.transitops.trip;

import com.transitops.driver.DriverService;
import com.transitops.driver.DriverStatus;
import com.transitops.vehicle.Vehicle;
import com.transitops.vehicle.VehicleService;
import com.transitops.vehicle.VehicleStatus;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class TripService {

    private final TripRepository tripRepository;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    @Autowired
    public TripService(TripRepository tripRepository, VehicleService vehicleService, DriverService driverService) {
        this.tripRepository = tripRepository;
        this.vehicleService = vehicleService;
        this.driverService = driverService;
    }

    public List<Trip> getAllTrips() {
        return tripRepository.findAll();
    }

    public Trip getTripById(Long id) {
        return tripRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Trip not found with ID: " + id));
    }

    @Transactional
    public Trip createTrip(Trip trip) {
        // Set initial status to DRAFT
        trip.setStatus(TripStatus.DRAFT);
        
        // Basic validations
        if (trip.getSource() == null || trip.getSource().trim().isEmpty()) {
            throw new IllegalArgumentException("Source is required.");
        }
        if (trip.getDestination() == null || trip.getDestination().trim().isEmpty()) {
            throw new IllegalArgumentException("Destination is required.");
        }
        if (trip.getVehicleId() == null) {
            throw new IllegalArgumentException("Vehicle ID is required.");
        }
        if (trip.getDriverId() == null) {
            throw new IllegalArgumentException("Driver ID is required.");
        }
        if (trip.getCargoWeight() <= 0) {
            throw new IllegalArgumentException("Cargo weight must be greater than zero.");
        }
        if (trip.getPlannedDistance() <= 0) {
            throw new IllegalArgumentException("Planned distance must be greater than zero.");
        }

        // Validate vehicle availability when creating/scheduling
        if (!vehicleService.isAvailable(trip.getVehicleId())) {
            throw new IllegalArgumentException("Selected vehicle is not available.");
        }

        // Validate driver availability when creating/scheduling
        if (!driverService.isAvailable(trip.getDriverId())) {
            throw new IllegalArgumentException("Selected driver is not available or license is expired.");
        }

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip dispatchTrip(Long id) {
        Trip trip = getTripById(id);

        if (trip.getStatus() != TripStatus.DRAFT) {
            throw new IllegalArgumentException("Only DRAFT trips can be dispatched.");
        }

        Long vehicleId = trip.getVehicleId();
        Long driverId = trip.getDriverId();

        // 1. Verify vehicle availability (status AVAILABLE)
        if (!vehicleService.isAvailable(vehicleId)) {
            throw new IllegalArgumentException("Vehicle is not available for dispatch.");
        }

        // 2. Verify driver availability (status AVAILABLE and valid license)
        if (!driverService.isAvailable(driverId)) {
            throw new IllegalArgumentException("Driver is not available for dispatch or license has expired.");
        }

        // 3. Cargo Weight must not exceed the selected vehicle's max_load_capacity
        Vehicle vehicle = vehicleService.getById(vehicleId);
        if (trip.getCargoWeight() > vehicle.getMaxLoadCapacity()) {
            throw new IllegalArgumentException("Cargo weight (" + trip.getCargoWeight() + 
                    " kg) exceeds vehicle's maximum load capacity (" + vehicle.getMaxLoadCapacity() + " kg).");
        }

        // 4. Update Trip Status to DISPATCHED
        trip.setStatus(TripStatus.DISPATCHED);

        // 5. Update vehicle and driver status to ON_TRIP
        vehicleService.updateStatus(vehicleId, VehicleStatus.ON_TRIP);
        driverService.updateStatus(driverId, DriverStatus.ON_TRIP);

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip completeTrip(Long id, double actualDistance, double fuelConsumed) {
        Trip trip = getTripById(id);

        if (trip.getStatus() != TripStatus.DISPATCHED) {
            throw new IllegalArgumentException("Only DISPATCHED trips can be completed.");
        }

        if (actualDistance <= 0) {
            throw new IllegalArgumentException("Actual distance must be greater than zero.");
        }
        if (fuelConsumed <= 0) {
            throw new IllegalArgumentException("Fuel consumed must be greater than zero.");
        }

        // Save actual distance and fuel consumed
        trip.setActualDistance(actualDistance);
        trip.setFuelConsumed(fuelConsumed);

        // Update trip status to COMPLETED
        trip.setStatus(TripStatus.COMPLETED);

        // Call vehicleService and driverService to update status to AVAILABLE
        vehicleService.updateStatus(trip.getVehicleId(), VehicleStatus.AVAILABLE);
        driverService.updateStatus(trip.getDriverId(), DriverStatus.AVAILABLE);

        return tripRepository.save(trip);
    }

    @Transactional
    public Trip cancelTrip(Long id) {
        Trip trip = getTripById(id);

        if (trip.getStatus() != TripStatus.DISPATCHED) {
            throw new IllegalArgumentException("Only DISPATCHED trips can be cancelled.");
        }

        // Update trip status to CANCELLED
        trip.setStatus(TripStatus.CANCELLED);

        // Restore vehicle and driver status back to AVAILABLE
        vehicleService.updateStatus(trip.getVehicleId(), VehicleStatus.AVAILABLE);
        driverService.updateStatus(trip.getDriverId(), DriverStatus.AVAILABLE);

        return tripRepository.save(trip);
    }
}
