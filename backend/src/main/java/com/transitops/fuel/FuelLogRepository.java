package com.transitops.fuel;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FuelLogRepository extends JpaRepository<FuelLog, Long> {

    List<FuelLog> findByVehicleIdOrderByLogDateDesc(Long vehicleId);

    @Query("SELECT COALESCE(SUM(f.cost), 0) FROM FuelLog f WHERE f.vehicleId = :vehicleId")
    Double getTotalFuelCostByVehicleId(@Param("vehicleId") Long vehicleId);
}
