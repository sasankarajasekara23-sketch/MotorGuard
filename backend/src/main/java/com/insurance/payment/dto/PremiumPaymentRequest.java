package com.insurance.payment.dto;

import com.insurance.payment.enums.PaymentMethod;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
public class PremiumPaymentRequest {

    @NotNull(message = "Policy ID is required")
    private UUID policyId;

    @NotNull(message = "Amount is required")
    @Positive(message = "Payment amount must be greater than zero")
    private BigDecimal amount;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String notes;
}
