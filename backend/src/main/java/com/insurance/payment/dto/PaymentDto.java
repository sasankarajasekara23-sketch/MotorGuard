package com.insurance.payment.dto;

import com.insurance.payment.enums.PaymentMethod;
import com.insurance.payment.enums.PaymentStatus;
import com.insurance.payment.enums.PaymentType;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class PaymentDto {
    private UUID id;
    private String transactionRef;
    private PaymentType paymentType;
    private BigDecimal amount;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private UUID policyId;
    private UUID claimId;
    private UUID customerId;
    private String customerName;
    private UUID processedByUserId;
    private String processedByUserName;
    private String notes;
    private LocalDateTime paymentDate;
}
