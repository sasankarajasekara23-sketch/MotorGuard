package com.insurance.policy.dto;

import com.insurance.policy.PolicyType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PolicyRequest {
    @NotNull
    private UUID vehicleId;

    @NotNull
    private PolicyType policyType;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}
