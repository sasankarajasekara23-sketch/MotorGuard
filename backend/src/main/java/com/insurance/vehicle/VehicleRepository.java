package com.insurance.vehicle;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByCustomerId(UUID customerId);

    // Duplicate check on create
    boolean existsByRegistrationNo(String registrationNo);
    boolean existsByChassisNo(String chassisNo);

    // Duplicate check on update (exclude the current vehicle being updated)
    boolean existsByRegistrationNoAndIdNot(String registrationNo, UUID id);
    boolean existsByChassisNoAndIdNot(String chassisNo, UUID id);
}
