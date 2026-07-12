package com.transitops.trip;

import com.transitops.common.ApiResponse;
import com.transitops.driver.Driver;
import com.transitops.driver.DriverService;
import com.transitops.vehicle.Vehicle;
import com.transitops.vehicle.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allow React frontend CORS requests
public class TripController {

    private final TripService tripService;
    private final VehicleService vehicleService;
    private final DriverService driverService;

    @Autowired
    public TripController(TripService tripService, VehicleService vehicleService, DriverService driverService) {
        this.tripService = tripService;
        this.vehicleService = vehicleService;
        this.driverService = driverService;
    }

    // Request DTOs
    public static class TripCreateRequest {
        public String source;
        public String destination;
        public Long vehicleId;
        public Long driverId;
        public double cargoWeight;
        public double plannedDistance;
        public Double revenue; // optional
    }

    public static class TripCompleteRequest {
        public double actualDistance;
        public double fuelConsumed;
    }

    // 1. Create Trip (POST /api/trips)
    @PostMapping("/trips")
    public ResponseEntity<ApiResponse<Trip>> createTrip(@RequestBody TripCreateRequest req) {
        try {
            Trip trip = new Trip();
            trip.setSource(req.source);
            trip.setDestination(req.destination);
            trip.setVehicleId(req.vehicleId);
            trip.setDriverId(req.driverId);
            trip.setCargoWeight(req.cargoWeight);
            trip.setPlannedDistance(req.plannedDistance);
            trip.setRevenue(req.revenue);

            Trip created = tripService.createTrip(trip);
            ApiResponse<Trip> response = new ApiResponse<>(true, "Trip created successfully in DRAFT status.", created);
            return new ResponseEntity<>(response, HttpStatus.CREATED);
        } catch (IllegalArgumentException e) {
            ApiResponse<Trip> response = new ApiResponse<>(false, e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // 2. List all Trips (GET /api/trips)
    @GetMapping("/trips")
    public ResponseEntity<ApiResponse<List<Trip>>> listAllTrips() {
        List<Trip> trips = tripService.getAllTrips();
        ApiResponse<List<Trip>> response = new ApiResponse<>(true, "Trips retrieved successfully.", trips);
        return ResponseEntity.ok(response);
    }

    // 3. Single Trip Detail (GET /api/trips/{id})
    @GetMapping("/trips/{id}")
    public ResponseEntity<ApiResponse<Trip>> getTripDetail(@PathVariable Long id) {
        try {
            Trip trip = tripService.getTripById(id);
            ApiResponse<Trip> response = new ApiResponse<>(true, "Trip details retrieved successfully.", trip);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Trip> response = new ApiResponse<>(false, e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
        }
    }

    // 4. Dispatch Trip (POST /api/trips/{id}/dispatch)
    @PostMapping("/trips/{id}/dispatch")
    public ResponseEntity<ApiResponse<Trip>> dispatchTrip(@PathVariable Long id) {
        try {
            Trip dispatched = tripService.dispatchTrip(id);
            ApiResponse<Trip> response = new ApiResponse<>(true, "Trip dispatched successfully. Vehicle and Driver status updated to ON_TRIP.", dispatched);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Trip> response = new ApiResponse<>(false, e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // 5. Complete Trip (POST /api/trips/{id}/complete)
    @PostMapping("/trips/{id}/complete")
    public ResponseEntity<ApiResponse<Trip>> completeTrip(@PathVariable Long id, @RequestBody TripCompleteRequest req) {
        try {
            Trip completed = tripService.completeTrip(id, req.actualDistance, req.fuelConsumed);
            ApiResponse<Trip> response = new ApiResponse<>(true, "Trip completed successfully. Vehicle and Driver status set to AVAILABLE.", completed);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Trip> response = new ApiResponse<>(false, e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // 6. Cancel Trip (POST /api/trips/{id}/cancel)
    @PostMapping("/trips/{id}/cancel")
    public ResponseEntity<ApiResponse<Trip>> cancelTrip(@PathVariable Long id) {
        try {
            Trip cancelled = tripService.cancelTrip(id);
            ApiResponse<Trip> response = new ApiResponse<>(true, "Trip cancelled successfully. Vehicle and Driver status reverted to AVAILABLE.", cancelled);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            ApiResponse<Trip> response = new ApiResponse<>(false, e.getMessage(), null);
            return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
        }
    }

    // Stub routes for Frontend dropdowns
    // GET /api/vehicles/available
    @GetMapping("/vehicles/available")
    public ResponseEntity<ApiResponse<List<Vehicle>>> getAvailableVehicles() {
        List<Vehicle> list = vehicleService.getAvailableVehicles();
        ApiResponse<List<Vehicle>> response = new ApiResponse<>(true, "Available vehicles retrieved successfully.", list);
        return ResponseEntity.ok(response);
    }

    // GET /api/drivers/available
    @GetMapping("/drivers/available")
    public ResponseEntity<ApiResponse<List<Driver>>> getAvailableDrivers() {
        List<Driver> list = driverService.getAvailableDrivers();
        ApiResponse<List<Driver>> response = new ApiResponse<>(true, "Available drivers retrieved successfully.", list);
        return ResponseEntity.ok(response);
    }
}
