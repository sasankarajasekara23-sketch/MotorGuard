package com.insurance.policy.dto;

import com.insurance.policy.PolicyType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDate;

@Data
public class PolicyUpdateRequest {
    @NotNull
    private PolicyType policyType;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate endDate;
}
