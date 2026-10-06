package com.insurance.payment;

import com.insurance.common.ApiResponse;
import com.insurance.payment.dto.ClaimPayoutRequest;
import com.insurance.payment.dto.PaymentDto;
import com.insurance.payment.dto.PremiumPaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/premium")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<PaymentDto>> payPremium(
            Authentication auth, @Valid @RequestBody PremiumPaymentRequest request) {
        PaymentDto payment = paymentService.processPremiumPayment(auth.getName(), request, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Premium payment processed successfully", payment));
    }

    @PostMapping("/payout")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'CLAIMS_OFFICER')")
    public ResponseEntity<ApiResponse<PaymentDto>> disburseClaimPayout(
            Authentication auth, @Valid @RequestBody ClaimPayoutRequest request) {
        PaymentDto payment = paymentService.processClaimPayout(auth.getName(), request, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Claim payout disbursed successfully", payment));
    }

    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getMyPayments(Authentication auth) {
        List<PaymentDto> payments = paymentService.getPaymentsByCustomerEmail(auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer payments retrieved", payments));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'FINANCE_EXECUTIVE', 'OPERATIONS_MANAGER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<PaymentDto>> getPaymentById(
            @PathVariable UUID id, Authentication auth) {
        PaymentDto payment = paymentService.getPaymentById(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Payment retrieved", payment));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('FINANCE_EXECUTIVE', 'OPERATIONS_MANAGER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getAllPayments() {
        List<PaymentDto> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(new ApiResponse<>(true, "All payments retrieved", payments));
    }

    @GetMapping("/policy/{policyId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'FINANCE_EXECUTIVE', 'OPERATIONS_MANAGER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getPaymentsByPolicy(
            @PathVariable UUID policyId, Authentication auth) {
        List<PaymentDto> payments = paymentService.getPaymentsByPolicyId(policyId, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy payments retrieved", payments));
    }

    @GetMapping("/claim/{claimId}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'FINANCE_EXECUTIVE', 'CLAIMS_OFFICER', 'SUPERVISOR')")
    public ResponseEntity<ApiResponse<List<PaymentDto>>> getPaymentsByClaim(
            @PathVariable UUID claimId, Authentication auth) {
        List<PaymentDto> payments = paymentService.getPaymentsByClaimId(claimId, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim payments retrieved", payments));
    }
}
