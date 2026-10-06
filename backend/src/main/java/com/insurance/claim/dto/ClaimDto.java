package com.insurance.claim.dto;

import com.insurance.claim.ClaimStatus;
import lombok.Data;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class ClaimDto {
    private UUID id;
    private UUID policyId;
    private String policyType;
    private String vehicleRegNo;
    private String submittedBy;
    private String description;
    private BigDecimal amount;
    private ClaimStatus status;
    private String reviewerNotes;
    private LocalDateTime submittedDate;
}
