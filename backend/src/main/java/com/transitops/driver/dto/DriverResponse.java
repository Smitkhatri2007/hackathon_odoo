package com.transitops.driver.dto;

import com.transitops.driver.Driver;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class DriverResponse {
    private Long id;
    private String name;
    private String dob;
    private String licenseNumber;
    private String licenseCategory;
    private String licenseExpiryDate;
    private String contactNumber;
    private Double safetyScore;
    private String status;

    public static DriverResponse fromEntity(Driver driver) {
        return new DriverResponse(
                driver.getId(),
                driver.getName(),
                driver.getDob() != null ? driver.getDob().toString() : null,
                driver.getLicenseNumber(),
                driver.getLicenseCategory(),
                driver.getLicenseExpiryDate().toString(),
                driver.getContactNumber(),
                driver.getSafetyScore(),
                driver.getStatus().name()
        );
    }
}
