package com.transitops.fuel;

import com.transitops.fuel.dto.FuelLogRequest;
import com.transitops.fuel.dto.FuelLogResponse;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class FuelLogService {

    private final FuelLogRepository fuelLogRepository;

    public FuelLogService(FuelLogRepository fuelLogRepository) {
        this.fuelLogRepository = fuelLogRepository;
    }

    public FuelLogResponse create(FuelLogRequest request) {
        FuelLog log = new FuelLog();
        log.setVehicleId(request.getVehicleId());
        log.setLiters(request.getLiters());
        log.setCost(request.getCost());
        log.setLogDate(request.getLogDate());
        return FuelLogResponse.from(fuelLogRepository.save(log));
    }

    public List<FuelLogResponse> getAll() {
        return fuelLogRepository.findAll()
                .stream()
                .map(FuelLogResponse::from)
                .collect(Collectors.toList());
    }

    public List<FuelLogResponse> getByVehicleId(Long vehicleId) {
        return fuelLogRepository.findByVehicleIdOrderByLogDateDesc(vehicleId)
                .stream()
                .map(FuelLogResponse::from)
                .collect(Collectors.toList());
    }

    public Double getTotalFuelCost(Long vehicleId) {
        return fuelLogRepository.getTotalFuelCostByVehicleId(vehicleId);
    }
}
