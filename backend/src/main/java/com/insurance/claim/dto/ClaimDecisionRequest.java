package com.insurance.claim.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ClaimDecisionRequest {
    @NotNull
    private Boolean approved;
    private String notes;
}
