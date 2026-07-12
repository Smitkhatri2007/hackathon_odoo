package com.transitops.vehicle;

import com.transitops.common.BadRequestException;
import com.transitops.common.DuplicateResourceException;
import com.transitops.common.ResourceNotFoundException;
import com.transitops.vehicle.dto.VehicleRequest;
import com.transitops.vehicle.dto.VehicleResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleService(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    // ========== Methods used by Trip module (teammate dependency) ==========

    public Vehicle getById(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
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

    // ========== CRUD operations ==========

    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll().stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public VehicleResponse getVehicleById(Long id) {
        return VehicleResponse.fromEntity(getById(id));
    }

    public List<VehicleResponse> getAvailableVehicles() {
        return vehicleRepository.findByStatus(VehicleStatus.AVAILABLE).stream()
                .map(VehicleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    public VehicleResponse createVehicle(VehicleRequest request) {
        if (vehicleRepository.existsByRegistrationNumber(request.getRegistrationNumber())) {
            throw new DuplicateResourceException(
                    "Vehicle with registration number '" + request.getRegistrationNumber() + "' already exists");
        }

        VehicleStatus status;
        try {
            status = VehicleStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid vehicle status: " + request.getStatus());
        }

        Vehicle vehicle = new Vehicle();
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setName(request.getName());
        vehicle.setType(request.getType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setStatus(status);

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {
        Vehicle vehicle = getById(id);

        vehicleRepository.findByRegistrationNumber(request.getRegistrationNumber())
                .ifPresent(existing -> {
                    if (!existing.getId().equals(id)) {
                        throw new DuplicateResourceException(
                                "Vehicle with registration number '" + request.getRegistrationNumber() + "' already exists");
                    }
                });

        VehicleStatus status;
        try {
            status = VehicleStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Invalid vehicle status: " + request.getStatus());
        }

        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setName(request.getName());
        vehicle.setType(request.getType());
        vehicle.setMaxLoadCapacity(request.getMaxLoadCapacity());
        vehicle.setOdometer(request.getOdometer());
        vehicle.setAcquisitionCost(request.getAcquisitionCost());
        vehicle.setStatus(status);

        Vehicle saved = vehicleRepository.save(vehicle);
        return VehicleResponse.fromEntity(saved);
    }

    public void deleteVehicle(Long id) {
        Vehicle vehicle = getById(id);
        vehicleRepository.delete(vehicle);
    }
}
