package com.transitops.driver;

import com.transitops.common.BadRequestException;
import com.transitops.common.DuplicateResourceException;
import com.transitops.common.ResourceNotFoundException;
import com.transitops.driver.dto.DriverRequest;
import com.transitops.driver.dto.DriverResponse;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class DriverService {

    private final DriverRepository driverRepository;

    public DriverService(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    // ========== Methods used by Trip module (teammate dependency) ==========

    public Driver getById(Long id) {
        return driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found with id: " + id));
    }

    public boolean isAvailable(Long id) {
        Driver driver = getById(id);
        if (driver.getStatus() == DriverStatus.SUSPENDED) {
            return false;
        }
        if (driver.getLicenseExpiryDate().isBefore(LocalDate.now())) {
            return false;
        }
        return driver.getStatus() == DriverStatus.AVAILABLE;
    }

    public void updateStatus(Long id, DriverStatus status) {
        Driver driver = getById(id);
        driver.setStatus(status);
        driverRepository.save(driver);
    }

    // ========== CRUD operations ==========

    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll().stream()
                .map(DriverResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public DriverResponse getDriverById(Long id) {
        return DriverResponse.fromEntity(getById(id));
    }

    public List<DriverResponse> getAvailableDrivers() {
        return driverRepository.findByStatus(DriverStatus.AVAILABLE).stream()
                .filter(driver -> !driver.getLicenseExpiryDate().isBefore(LocalDate.now()))
                .map(DriverResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public DriverResponse createDriver(DriverRequest request) {
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new DuplicateResourceException(
                    "Driver with license number '" + request.getLicenseNumber() + "' already exists");
        }

        DriverStatus status;
        try {
            status = DriverStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid driver status: " + request.getStatus());
        }

        Driver driver = new Driver();
        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseCategory(request.getLicenseCategory());
        driver.setLicenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()));
        driver.setContactNumber(request.getContactNumber());
        driver.setSafetyScore(request.getSafetyScore());
        driver.setStatus(status);

        Driver saved = driverRepository.save(driver);
        return DriverResponse.fromEntity(saved);
    }

    public DriverResponse updateDriver(Long id, DriverRequest request) {
        Driver driver = getById(id);

        driverRepository.findByLicenseNumber(request.getLicenseNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Driver with license number '" + request.getLicenseNumber() + "' already exists");
                    }
                });

        DriverStatus status;
        try {
            status = DriverStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid driver status: " + request.getStatus());
        }

        driver.setName(request.getName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setLicenseCategory(request.getLicenseCategory());
        driver.setLicenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()));
        driver.setContactNumber(request.getContactNumber());
        driver.setSafetyScore(request.getSafetyScore());
        driver.setStatus(status);

        Driver saved = driverRepository.save(driver);
        return DriverResponse.fromEntity(saved);
    }

    public void deleteDriver(Long id) {
        Driver driver = getById(id);
        driverRepository.delete(driver);
    }
}
