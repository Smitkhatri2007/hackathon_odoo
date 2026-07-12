package com.transitops.config;

import com.transitops.driver.Driver;
import com.transitops.driver.DriverRepository;
import com.transitops.driver.DriverStatus;
import com.transitops.vehicle.Vehicle;
import com.transitops.vehicle.VehicleRepository;
import com.transitops.vehicle.VehicleStatus;
import com.transitops.trip.Trip;
import com.transitops.trip.TripRepository;
import com.transitops.trip.TripStatus;
import com.transitops.maintenance.MaintenanceLog;
import com.transitops.maintenance.MaintenanceLogRepository;
import com.transitops.maintenance.MaintenanceStatus;
import com.transitops.fuel.FuelLog;
import com.transitops.fuel.FuelLogRepository;
import com.transitops.expense.Expense;
import com.transitops.expense.ExpenseRepository;
import com.transitops.auth.User;
import com.transitops.auth.UserRepository;
import com.transitops.auth.Role;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(
            VehicleRepository vehicleRepository,
            DriverRepository driverRepository,
            TripRepository tripRepository,
            MaintenanceLogRepository maintenanceLogRepository,
            FuelLogRepository fuelLogRepository,
            ExpenseRepository expenseRepository,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        
        return args -> {
            try {
                System.out.println("Checking Database Seeding...");

                // 0. Users
                if (userRepository.count() == 0) {
                    System.out.println("Seeding Users...");
                    User admin = new User();
                    admin.setName("Admin User");
                    admin.setEmail("admin@example.com");
                    admin.setPassword(passwordEncoder.encode("admin"));
                    admin.setRole(Role.FLEET_MANAGER);
                    userRepository.save(admin);
                }

                // 1. Vehicles
                Vehicle v1 = null;
                Vehicle v2 = null;
                Vehicle v3 = null;
                if (vehicleRepository.count() == 0) {
                    System.out.println("Seeding Vehicles...");
                    v1 = new Vehicle();
                    v1.setName("Transit Van A1");
                    v1.setRegistrationNumber("TX-1234");
                    v1.setType("VAN");
                    v1.setAcquisitionCost(25000.0);
                    v1.setMaxLoadCapacity(1500.0);
                    v1.setOdometer(12000.0);
                    v1.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(v1);

                    v2 = new Vehicle();
                    v2.setName("Heavy Truck B2");
                    v2.setRegistrationNumber("CA-9876");
                    v2.setType("TRUCK");
                    v2.setAcquisitionCost(85000.0);
                    v2.setMaxLoadCapacity(8000.0);
                    v2.setOdometer(45000.0);
                    v2.setStatus(VehicleStatus.AVAILABLE);
                    vehicleRepository.save(v2);

                    v3 = new Vehicle();
                    v3.setName("Delivery Truck C3");
                    v3.setRegistrationNumber("NY-5555");
                    v3.setType("TRUCK");
                    v3.setAcquisitionCost(55000.0);
                    v3.setMaxLoadCapacity(5000.0);
                    v3.setOdometer(22000.0);
                    v3.setStatus(VehicleStatus.IN_SHOP);
                    vehicleRepository.save(v3);
                }

                // 2. Drivers
                Driver d1 = null;
                Driver d2 = null;
                if (driverRepository.count() == 0) {
                    System.out.println("Seeding Drivers...");
                    d1 = new Driver();
                    d1.setName("Alice Smith");
                    d1.setLicenseNumber("DL-111222");
                    d1.setLicenseCategory("COMMERCIAL");
                    d1.setLicenseExpiryDate(LocalDate.now().plusYears(2));
                    d1.setStatus(DriverStatus.AVAILABLE);
                    d1.setSafetyScore(98.5);
                    d1.setContactNumber("555-0101");
                    driverRepository.save(d1);

                    d2 = new Driver();
                    d2.setName("Bob Jones");
                    d2.setLicenseNumber("DL-333444");
                    d2.setLicenseCategory("STANDARD");
                    d2.setLicenseExpiryDate(LocalDate.now().plusYears(1));
                    d2.setStatus(DriverStatus.AVAILABLE);
                    d2.setSafetyScore(85.0);
                    d2.setContactNumber("555-0202");
                    driverRepository.save(d2);
                }

                // 3. Trips
                if (tripRepository.count() == 0 && vehicleRepository.count() >= 2 && driverRepository.count() >= 2) {
                    System.out.println("Seeding Trips...");
                    if (v1 == null) v1 = vehicleRepository.findAll().get(0);
                    if (v2 == null) v2 = vehicleRepository.findAll().get(1);
                    if (d1 == null) d1 = driverRepository.findAll().get(0);
                    if (d2 == null) d2 = driverRepository.findAll().get(1);

                    Trip t1 = new Trip();
                    t1.setSource("Warehouse A");
                    t1.setDestination("Store 42");
                    t1.setVehicleId(v1.getId());
                    t1.setDriverId(d1.getId());
                    t1.setCargoWeight(800.0);
                    t1.setPlannedDistance(45.5);
                    t1.setStatus(TripStatus.DISPATCHED);
                    t1.setCreatedAt(LocalDateTime.now().minusHours(2));
                    tripRepository.save(t1);

                    Trip t2 = new Trip();
                    t2.setSource("Port Dock 9");
                    t2.setDestination("Distribution Center B");
                    t2.setVehicleId(v2.getId());
                    t2.setDriverId(d2.getId());
                    t2.setCargoWeight(5000.0);
                    t2.setPlannedDistance(120.0);
                    t2.setActualDistance(122.5);
                    t2.setFuelConsumed(35.0);
                    t2.setStatus(TripStatus.COMPLETED);
                    t2.setCreatedAt(LocalDateTime.now().minusDays(1));
                    t2.setRevenue(850.0);
                    tripRepository.save(t2);
                }

                // 4. Maintenance
                if (maintenanceLogRepository.count() == 0 && vehicleRepository.count() >= 3) {
                    System.out.println("Seeding Maintenance Logs...");
                    if (v2 == null) v2 = vehicleRepository.findAll().get(1);
                    if (v3 == null) v3 = vehicleRepository.findAll().get(2);

                    MaintenanceLog m1 = new MaintenanceLog();
                    m1.setVehicleId(v3.getId());
                    m1.setType("ENGINE_REPAIR");
                    m1.setDescription("Replacing spark plugs and oil change");
                    m1.setStatus(MaintenanceStatus.OPEN);
                    m1.setCreatedAt(LocalDateTime.now().minusDays(1));
                    maintenanceLogRepository.save(m1);

                    MaintenanceLog m2 = new MaintenanceLog();
                    m2.setVehicleId(v2.getId());
                    m2.setType("TIRE_REPLACEMENT");
                    m2.setDescription("Replaced rear tires");
                    m2.setCost(1200.0);
                    m2.setStatus(MaintenanceStatus.CLOSED);
                    m2.setCreatedAt(LocalDateTime.now().minusMonths(1));
                    m2.setClosedAt(LocalDateTime.now().minusMonths(1).plusDays(2));
                    maintenanceLogRepository.save(m2);
                }

                // 5. Fuel Logs
                if (fuelLogRepository.count() == 0 && vehicleRepository.count() >= 2) {
                    System.out.println("Seeding Fuel Logs...");
                    if (v2 == null) v2 = vehicleRepository.findAll().get(1);
                    FuelLog f1 = new FuelLog();
                    f1.setVehicleId(v2.getId());
                    f1.setLiters(150.0);
                    f1.setCost(450.0);
                    f1.setLogDate(LocalDate.now().minusDays(1));
                    fuelLogRepository.save(f1);
                }

                // 6. Expenses
                if (expenseRepository.count() == 0 && vehicleRepository.count() >= 2) {
                    System.out.println("Seeding Expenses...");
                    if (v2 == null) v2 = vehicleRepository.findAll().get(1);
                    Expense e1 = new Expense();
                    e1.setVehicleId(v2.getId());
                    e1.setType("TOLL");
                    e1.setCost(25.0);
                    e1.setLogDate(LocalDate.now().minusDays(1));
                    expenseRepository.save(e1);
                }

                System.out.println("Database seeding verification completed successfully!");
            } catch (Exception e) {
                System.out.println("Seeding skipped or failed: " + e.getMessage());
                e.printStackTrace();
            }
        };
    }
}
