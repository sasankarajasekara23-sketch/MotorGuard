package com.insurance.customer;

import com.insurance.common.ApiResponse;
import com.insurance.customer.dto.CustomerDto;
import com.insurance.customer.dto.ProfileUpdateResponse;
import com.insurance.customer.dto.UpdateCustomerRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/customers")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @GetMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<CustomerDto>> getMyProfile(Authentication auth) {
        CustomerDto customer = customerService.getCustomerByEmail(auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile retrieved", customer));
    }

    @PutMapping("/me")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ProfileUpdateResponse>> updateMyProfile(
            Authentication auth, @Valid @RequestBody UpdateCustomerRequest request) {
        ProfileUpdateResponse response = customerService.updateMyProfile(auth.getName(), request);
        return ResponseEntity.ok(new ApiResponse<>(true, "Profile updated", response));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<CustomerDto>> getCustomerById(
            @PathVariable UUID id, Authentication auth) {
        CustomerDto customer = customerService.getCustomerById(id, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer retrieved", customer));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<CustomerDto>> updateCustomerById(
            @PathVariable UUID id, @Valid @RequestBody UpdateCustomerRequest request, Authentication auth) {
        CustomerDto customer = customerService.updateCustomerById(id, request, auth);
        return ResponseEntity.ok(new ApiResponse<>(true, "Customer updated", customer));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('SUPERVISOR', 'OPERATIONS_MANAGER', 'BRANCH_MANAGER')")
    public ResponseEntity<ApiResponse<List<CustomerDto>>> getAllCustomers() {
        List<CustomerDto> customers = customerService.getAllCustomers();
        return ResponseEntity.ok(new ApiResponse<>(true, "Customers retrieved", customers));
    }
}
