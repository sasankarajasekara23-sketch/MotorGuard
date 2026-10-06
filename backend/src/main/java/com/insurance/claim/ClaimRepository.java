package com.insurance.claim;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface ClaimRepository extends JpaRepository<Claim, UUID> {
    List<Claim> findBySubmittedById(UUID userId);
    boolean existsByPolicyId(UUID policyId);
}
