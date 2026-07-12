package com.transitops.driver;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class DriverService {
    private final Map<Long, Driver> drivers = new ConcurrentHashMap<>();

    public DriverService() {
        // Pre-seed driver 'Alex' with ID 1
        drivers.put(1L, new Driver(1L, "Alex", "DL-9999", false, DriverStatus.AVAILABLE));
        // Add another mock driver
        drivers.put(2L, new Driver(2L, "Bob", "DL-8888", false, DriverStatus.AVAILABLE));
        // Add a driver with expired license
        drivers.put(3L, new Driver(3L, "Charlie (Expired)", "DL-7777", true, DriverStatus.AVAILABLE));
    }

    public Driver getById(Long id) {
        Driver driver = drivers.get(id);
        if (driver == null) {
            throw new IllegalArgumentException("Driver not found with ID: " + id);
        }
        return driver;
    }

    public boolean isAvailable(Long id) {
        Driver driver = drivers.get(id);
        return driver != null && driver.getStatus() == DriverStatus.AVAILABLE && !driver.isLicenseExpired();
    }

    public void updateStatus(Long id, DriverStatus status) {
        Driver driver = drivers.get(id);
        if (driver != null) {
            driver.setStatus(status);
        }
    }

    public List<Driver> getAvailableDrivers() {
        List<Driver> available = new ArrayList<>();
        for (Driver d : drivers.values()) {
            if (d.getStatus() == DriverStatus.AVAILABLE && !d.isLicenseExpired()) {
                available.add(d);
            }
        }
        return available;
    }

    // Helper for test/setup
    public void registerDriver(Driver driver) {
        drivers.put(driver.getId(), driver);
    }
}
