package com.insurance.claim.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;
import java.math.BigDecimal;
import java.util.UUID;

@Data
public class ClaimRequest {

    @NotNull(message = "Policy ID is required")
    private UUID policyId;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Claim amount is required")
    @Positive(message = "Claim amount must be greater than zero")
    private BigDecimal amount;
}
