package com.insurance.policy;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PolicyRepository extends JpaRepository<Policy, UUID> {

    List<Policy> findByVehicleCustomerId(UUID customerId);

    // Active overlap prevention: check if a vehicle already has an ACTIVE policy
    boolean existsByVehicleIdAndStatus(UUID vehicleId, PolicyStatus status);

    // Vehicle deletion dependency check: check if any policy exists for the vehicle
    boolean existsByVehicleId(UUID vehicleId);
}
