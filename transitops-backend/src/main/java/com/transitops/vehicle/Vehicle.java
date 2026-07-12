package com.transitops.vehicle;

public class Vehicle {
    private Long id;
    private String registrationNumber;
    private double maxLoadCapacity;
    private VehicleStatus status;

    public Vehicle() {}

    public Vehicle(Long id, String registrationNumber, double maxLoadCapacity, VehicleStatus status) {
        this.id = id;
        this.registrationNumber = registrationNumber;
        this.maxLoadCapacity = maxLoadCapacity;
        this.status = status;
    }

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

    public double getMaxLoadCapacity() {
        return maxLoadCapacity;
    }

    public void setMaxLoadCapacity(double maxLoadCapacity) {
        this.maxLoadCapacity = maxLoadCapacity;
    }

    public VehicleStatus getStatus() {
        return status;
    }

    public void setStatus(VehicleStatus status) {
        this.status = status;
    }
}
