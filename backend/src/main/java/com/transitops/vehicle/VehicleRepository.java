package com.transitops.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * Stub VehicleRepository — Person 1 owns this.
 */
@Repository
public interface VehicleRepository extends org.springframework.data.jpa.repository.JpaRepository<Vehicle, Long> {
}
