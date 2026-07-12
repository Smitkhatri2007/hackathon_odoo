package com.transitops.trip;

import com.transitops.driver.Driver;
import com.transitops.driver.DriverService;
import com.transitops.driver.DriverStatus;
import com.transitops.vehicle.Vehicle;
import com.transitops.vehicle.VehicleService;
import com.transitops.vehicle.VehicleStatus;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class TripServiceTest {

    @Autowired
    private TripService tripService;

    @Autowired
    private VehicleService vehicleService;

    @Autowired
    private DriverService driverService;

    @Autowired
    private TripRepository tripRepository;

    @BeforeEach
    public void setUp() {
        // Clear all trips
        tripRepository.deleteAll();

        // Register testing vehicle: 'Van-05', max capacity 500kg, status AVAILABLE
        Vehicle vehicle = new Vehicle(1L, "Van-05", 500.0, VehicleStatus.AVAILABLE);
        vehicleService.registerVehicle(vehicle);

        // Register testing driver: 'Alex', valid driving license, status AVAILABLE
        Driver driver = new Driver(1L, "Alex", "DL-9999", false, DriverStatus.AVAILABLE);
        driverService.registerDriver(driver);
    }

    @Test
    public void testCompleteTripLifecycleWorkflow() {
        // 1. Create a trip with Cargo Weight = 450kg (Planned Distance = 100km, Vehicle = 1L, Driver = 1L)
        Trip trip = new Trip();
        trip.setSource("Warehouse A");
        trip.setDestination("Distribution Center B");
        trip.setVehicleId(1L);
        trip.setDriverId(1L);
        trip.setCargoWeight(450.0);
        trip.setPlannedDistance(100.0);
        trip.setRevenue(1200.0);

        Trip created = tripService.createTrip(trip);
        assertNotNull(created.getId(), "Trip ID should be generated.");
        assertEquals(TripStatus.DRAFT, created.getStatus(), "Trip status must start as DRAFT.");

        // 2. Dispatch the trip
        Trip dispatched = tripService.dispatchTrip(created.getId());
        assertEquals(TripStatus.DISPATCHED, dispatched.getStatus(), "Trip status should be DISPATCHED.");

        // 3. Verify vehicle and driver status automatically become ON_TRIP
        assertEquals(VehicleStatus.ON_TRIP, vehicleService.getById(1L).getStatus(), "Vehicle status should update to ON_TRIP.");
        assertEquals(DriverStatus.ON_TRIP, driverService.getById(1L).getStatus(), "Driver status should update to ON_TRIP.");

        // 4. Try to dispatch another trip with the same vehicle (should fail)
        assertFalse(vehicleService.isAvailable(1L), "Vehicle should not be available now.");
        assertFalse(driverService.isAvailable(1L), "Driver should not be available now.");

        Trip trip2 = new Trip();
        trip2.setSource("Warehouse A");
        trip2.setDestination("Client Site C");
        trip2.setVehicleId(1L);
        trip2.setDriverId(1L);
        trip2.setCargoWeight(100.0);
        trip2.setPlannedDistance(50.0);

        // Expect exception during creation or dispatch because vehicle/driver are not available
        assertThrows(IllegalArgumentException.class, () -> {
            tripService.createTrip(trip2);
        }, "Should throw exception as vehicle/driver are currently on another trip.");

        // 5. Complete the trip by entering actual distance and fuel consumed
        Trip completed = tripService.completeTrip(dispatched.getId(), 105.0, 12.5);
        assertEquals(TripStatus.COMPLETED, completed.getStatus(), "Trip status should be COMPLETED.");
        assertEquals(105.0, completed.getActualDistance(), "Actual distance should be saved.");
        assertEquals(12.5, completed.getFuelConsumed(), "Fuel consumed should be saved.");

        // 6. Verify system marks both Vehicle and Driver as AVAILABLE again
        assertEquals(VehicleStatus.AVAILABLE, vehicleService.getById(1L).getStatus(), "Vehicle status should revert to AVAILABLE.");
        assertEquals(DriverStatus.AVAILABLE, driverService.getById(1L).getStatus(), "Driver status should revert to AVAILABLE.");
    }

    @Test
    public void testCargoWeightExceedsCapacityValidation() {
        // Create trip with Cargo Weight = 600kg, which exceeds 'Van-05' capacity of 500kg
        Trip trip = new Trip();
        trip.setSource("Warehouse A");
        trip.setDestination("Distribution Center B");
        trip.setVehicleId(1L);
        trip.setDriverId(1L);
        trip.setCargoWeight(600.0);
        trip.setPlannedDistance(100.0);

        Trip created = tripService.createTrip(trip);

        // Attempting to dispatch should throw IllegalArgumentException
        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class, () -> {
            tripService.dispatchTrip(created.getId());
        });
        assertTrue(exception.getMessage().contains("exceeds vehicle's maximum load capacity"));
    }
}
