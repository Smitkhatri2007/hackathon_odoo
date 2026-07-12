package com.transitops.driver;

public class Driver {
    private Long id;
    private String name;
    private String licenseNumber;
    private boolean licenseExpired;
    private DriverStatus status;

    public Driver() {}

    public Driver(Long id, String name, String licenseNumber, boolean licenseExpired, DriverStatus status) {
        this.id = id;
        this.name = name;
        this.licenseNumber = licenseNumber;
        this.licenseExpired = licenseExpired;
        this.status = status;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLicenseNumber() {
        return licenseNumber;
    }

    public void setLicenseNumber(String licenseNumber) {
        this.licenseNumber = licenseNumber;
    }

    public boolean isLicenseExpired() {
        return licenseExpired;
    }

    public void setLicenseExpired(boolean licenseExpired) {
        this.licenseExpired = licenseExpired;
    }

    public DriverStatus getStatus() {
        return status;
    }

    public void setStatus(DriverStatus status) {
        this.status = status;
    }
}
