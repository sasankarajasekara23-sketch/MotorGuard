package com.insurance.policy.dto;

import com.insurance.policy.PolicyStatus;
import com.insurance.policy.PolicyType;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Data
public class PolicyDto {
    private UUID id;
    private UUID vehicleId;
    private String vehicleRegNo;
    private PolicyType policyType;
    private LocalDate startDate;
    private LocalDate endDate;
    private BigDecimal premiumAmount;
    private PolicyStatus status;
}
