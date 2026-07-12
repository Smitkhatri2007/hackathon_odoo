package com.transitops.maintenance;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MaintenanceLogRepository extends JpaRepository<MaintenanceLog, Long> {

    List<MaintenanceLog> findByVehicleIdOrderByCreatedAtDesc(Long vehicleId);

    @Query("SELECT COALESCE(SUM(m.cost), 0) FROM MaintenanceLog m WHERE m.vehicleId = :vehicleId AND m.status = 'CLOSED'")
    Double getTotalMaintenanceCostByVehicleId(@Param("vehicleId") Long vehicleId);
}
