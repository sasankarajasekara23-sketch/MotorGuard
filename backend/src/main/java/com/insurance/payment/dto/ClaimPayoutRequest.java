package com.insurance.payment.dto;

import com.insurance.payment.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class ClaimPayoutRequest {

    @NotNull(message = "Claim ID is required")
    private UUID claimId;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String notes;
}
