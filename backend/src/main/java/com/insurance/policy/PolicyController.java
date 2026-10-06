package com.insurance.policy;

import com.insurance.common.ApiResponse;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.policy.dto.PolicyDto;
import com.insurance.policy.dto.PolicyRequest;
import com.insurance.policy.dto.PolicyUpdateRequest;
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
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final CustomerRepository customerRepository;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getMyPolicies(Authentication auth) {
        Customer customer = customerRepository.findByUserEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        List<PolicyDto> policies = policyService.getPoliciesByCustomerId(customer.getId());
        return ResponseEntity.ok(new ApiResponse<>(true, "Policies retrieved", policies));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('OPERATIONS_MANAGER', 'SUPERVISOR', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<List<PolicyDto>>> getAllPolicies() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All policies retrieved", policyService.getAllPolicies()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER', 'SUPERVISOR', 'FINANCE_EXECUTIVE', 'CLAIMS_OFFICER')")
    public ResponseEntity<ApiResponse<PolicyDto>> getPolicyById(
            @PathVariable UUID id, Authentication auth) {
        PolicyDto policy = policyService.getPolicyById(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy retrieved", policy));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<PolicyDto>> createPolicy(
            @Valid @RequestBody PolicyRequest request, Authentication auth) {
        PolicyDto policy = policyService.createPolicy(request, auth);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Policy created", policy));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<PolicyDto>> updatePolicy(
            @PathVariable UUID id, @Valid @RequestBody PolicyUpdateRequest request, Authentication auth) {
        PolicyDto policy = policyService.updatePolicy(id, request, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy updated", policy));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(@PathVariable UUID id, Authentication auth) {
        policyService.deletePolicy(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy deleted", null));
    }

    @PostMapping("/{id}/renew")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'OPERATIONS_MANAGER')")
    public ResponseEntity<ApiResponse<PolicyDto>> renewPolicy(
            @PathVariable UUID id, Authentication auth) {
        PolicyDto policy = policyService.renewPolicy(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Policy renewed", policy));
    }
}
