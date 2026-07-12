package com.transitops.vehicle;

import jakarta.persistence.*;

/**
 * Stub Vehicle entity — Person 1 owns this file and will replace it.
 * Person 3 needs it so VehicleService.getById() compiles.
 */
@Entity
@Table(name = "vehicles")
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "registration_number", unique = true)
    private String registrationNumber;

    private String name;
    private String type;

    @Column(name = "max_load_capacity")
    private Double maxLoadCapacity;

    private Double odometer;

    @Column(name = "acquisition_cost")
    private Double acquisitionCost;

    @Enumerated(EnumType.STRING)
    private VehicleStatus status;

    // Getters & Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRegistrationNumber() {
        return registrationNumber;
    }

    public void setRegistrationNumber(String registrationNumber) {
        this.registrationNumber = registrationNumber;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Double getMaxLoadCapacity() {
        return maxLoadCapacity;
    }

    public void setMaxLoadCapacity(Double maxLoadCapacity) {
        this.maxLoadCapacity = maxLoadCapacity;
    }

    public Double getOdometer() {
        return odometer;
    }

    public void setOdometer(Double odometer) {
        this.odometer = odometer;
    }

    public Double getAcquisitionCost() {
        return acquisitionCost;
    }

    public void setAcquisitionCost(Double acquisitionCost) {
        this.acquisitionCost = acquisitionCost;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }
}
