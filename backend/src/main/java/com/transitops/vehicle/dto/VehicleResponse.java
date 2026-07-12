package com.transitops.vehicle.dto;

import com.transitops.vehicle.Vehicle;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleResponse {
    private Long id;
    private String registrationNumber;
    private String name;
    private String type;
    private Double maxLoadCapacity;
    private Double odometer;
    private Double acquisitionCost;
    private String status;

    public static VehicleResponse fromEntity(Vehicle vehicle) {
        return new VehicleResponse(
                vehicle.getId(),
                vehicle.getRegistrationNumber(),
                vehicle.getName(),
                vehicle.getType(),
                vehicle.getMaxLoadCapacity(),
                vehicle.getOdometer(),
                vehicle.getAcquisitionCost(),
                vehicle.getStatus().name()
        );
    }
}
