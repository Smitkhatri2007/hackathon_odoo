package com.transitops.driver.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DriverRequest {
    @NotBlank(message = "Name is required")
    private String name;

    private String dob;

    @NotBlank(message = "License number is required")
    private String licenseNumber;

    @NotBlank(message = "License category is required")
    private String licenseCategory;

    @NotNull(message = "License expiry date is required")
    private String licenseExpiryDate;

    @NotBlank(message = "Contact number is required")
    private String contactNumber;

    @NotNull(message = "Safety score is required")
    private Double safetyScore;

    @NotNull(message = "Status is required")
    private String status;
}
