package com.insurance.customer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import java.util.UUID;

public interface CustomerRepository extends JpaRepository<Customer, UUID> {
    Optional<Customer> findByUserEmail(String email);
    Optional<Customer> findByUserId(UUID userId);
    boolean existsByNationalIdAndIdNot(String nationalId, UUID id);
}
