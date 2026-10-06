package com.insurance.claim;

import com.insurance.claim.dto.ClaimDecisionRequest;
import com.insurance.claim.dto.ClaimDto;
import com.insurance.claim.dto.ClaimRequest;
import com.insurance.claim.dto.ClaimUpdateRequest;
import com.insurance.common.ApiResponse;
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
@RequestMapping("/api/claims")
@RequiredArgsConstructor
public class ClaimController {

    private final ClaimService claimService;

    @GetMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<List<ClaimDto>>> getMyClaims(Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claims retrieved", claimService.getClaimsByUser(auth.getName())));
    }

    @GetMapping("/all")
    @PreAuthorize("hasAnyRole('CLAIMS_OFFICER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<List<ClaimDto>>> getAllClaims() {
        return ResponseEntity.ok(new ApiResponse<>(true, "All claims retrieved", claimService.getAllClaims()));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('CUSTOMER', 'CLAIMS_OFFICER', 'SUPERVISOR', 'OPERATIONS_MANAGER', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<ClaimDto>> getClaimById(@PathVariable UUID id, Authentication auth) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim retrieved", claimService.getClaimById(id, auth)));
    }

    @PostMapping
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ClaimDto>> submitClaim(
            Authentication auth, @Valid @RequestBody ClaimRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new ApiResponse<>(true, "Claim submitted", claimService.submitClaim(auth.getName(), request)));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<ClaimDto>> updateClaim(
            @PathVariable UUID id, Authentication auth, @Valid @RequestBody ClaimUpdateRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim updated", claimService.updateClaim(id, auth.getName(), request)));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<ApiResponse<Void>> deleteClaim(@PathVariable UUID id, Authentication auth) {
        claimService.deleteClaim(id, auth.getName());
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim deleted", null));
    }

    @PutMapping("/{id}/review")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public ResponseEntity<ApiResponse<ClaimDto>> reviewClaim(@PathVariable UUID id) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim under review", claimService.reviewClaim(id)));
    }

    @PutMapping("/{id}/decide")
    @PreAuthorize("hasRole('CLAIMS_OFFICER')")
    public ResponseEntity<ApiResponse<ClaimDto>> decideClaim(
            @PathVariable UUID id, @Valid @RequestBody ClaimDecisionRequest request) {
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim decision saved", claimService.decideClaim(id, request)));
    }

    @PutMapping("/{id}/pay")
    @PreAuthorize("hasAnyRole('CLAIMS_OFFICER', 'FINANCE_EXECUTIVE')")
    public ResponseEntity<ApiResponse<ClaimDto>> payClaim(@PathVariable UUID id, Authentication auth) {
        String callerEmail = auth != null ? auth.getName() : null;
        return ResponseEntity.ok(new ApiResponse<>(true, "Claim paid", claimService.payClaim(id, callerEmail)));
    }
}
