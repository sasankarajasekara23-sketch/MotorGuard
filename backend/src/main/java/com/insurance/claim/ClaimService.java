package com.insurance.claim;

import com.insurance.claim.dto.ClaimDecisionRequest;
import com.insurance.claim.dto.ClaimDto;
import com.insurance.claim.dto.ClaimRequest;
import com.insurance.claim.dto.ClaimUpdateRequest;
import com.insurance.claim.state.ClaimStateFactory;
import com.insurance.common.BusinessRuleException;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.payment.PaymentService;
import com.insurance.payment.enums.PaymentMethod;
import com.insurance.policy.Policy;
import com.insurance.policy.PolicyRepository;
import com.insurance.policy.PolicyStatus;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final ClaimRepository claimRepository;
    private final PolicyRepository policyRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;

    public List<ClaimDto> getClaimsByUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return claimRepository.findBySubmittedById(user.getId()).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<ClaimDto> getAllClaims() {
        return claimRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public ClaimDto getClaimById(UUID id, Authentication auth) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));
        verifyClaimAccess(claim, auth);
        return mapToDto(claim);
    }

    @Transactional
    public ClaimDto submitClaim(String email, ClaimRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        // Step 1 IDOR fix: ensure the policy's vehicle belongs to the submitting customer
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        UUID policyOwnerCustomerId = policy.getVehicle().getCustomer().getId();
        if (!policyOwnerCustomerId.equals(customer.getId())) {
            throw new AccessDeniedException("You can only submit claims against your own policies");
        }

        // Policy validity rule: claim can only be submitted against an ACTIVE policy
        if (policy.getStatus() != PolicyStatus.ACTIVE) {
            throw new BusinessRuleException(
                    "Claims can only be submitted against an ACTIVE policy. Current policy status: " + policy.getStatus());
        }

        // Verify current date falls within policy coverage period
        LocalDate today = LocalDate.now();
        if (today.isBefore(policy.getStartDate()) || today.isAfter(policy.getEndDate())) {
            throw new BusinessRuleException(
                    "Claims can only be submitted during the policy coverage period (" +
                    policy.getStartDate() + " to " + policy.getEndDate() + ").");
        }

        Claim claim = new Claim();
        claim.setPolicy(policy);
        claim.setSubmittedBy(user);
        claim.setDescription(request.getDescription());
        claim.setAmount(request.getAmount());
        claim.setStatus(ClaimStatus.SUBMITTED);

        return mapToDto(claimRepository.save(claim));
    }

    @Transactional
    public ClaimDto updateClaim(UUID id, String callerEmail, ClaimUpdateRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        verifyClaimOwner(claim, callerEmail);
        ClaimStateFactory.of(claim.getStatus()).ensureEditable();

        claim.setDescription(request.getDescription());
        claim.setAmount(request.getAmount());
        return mapToDto(claimRepository.save(claim));
    }

    @Transactional
    public void deleteClaim(UUID id, String callerEmail) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        verifyClaimOwner(claim, callerEmail);
        ClaimStateFactory.of(claim.getStatus()).ensureDeletable();

        claimRepository.delete(claim);
    }

    private void verifyClaimOwner(Claim claim, String callerEmail) {
        String ownerEmail = claim.getSubmittedBy().getEmail();
        if (!ownerEmail.equalsIgnoreCase(callerEmail)) {
            throw new AccessDeniedException("You do not have permission to modify this claim");
        }
    }

    @Transactional
    public ClaimDto reviewClaim(UUID id) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        claim.setStatus(ClaimStateFactory.of(claim.getStatus()).review());
        return mapToDto(claimRepository.save(claim));
    }

    @Transactional
    public ClaimDto decideClaim(UUID id, ClaimDecisionRequest request) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        claim.setStatus(ClaimStateFactory.of(claim.getStatus()).decide(Boolean.TRUE.equals(request.getApproved())));
        claim.setReviewerNotes(request.getNotes());
        return mapToDto(claimRepository.save(claim));
    }

    @Transactional
    public ClaimDto payClaim(UUID id) {
        return payClaim(id, null);
    }

    @Transactional
    public ClaimDto payClaim(UUID id, String callerEmail) {
        Claim claim = claimRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        User actor = null;
        if (callerEmail != null) {
            actor = userRepository.findByEmail(callerEmail).orElse(null);
        }
        if (actor == null) {
            actor = claim.getSubmittedBy();
        }

        paymentService.executeClaimPayout(claim, actor, PaymentMethod.BANK_TRANSFER, "Claim settlement payout via claims queue");

        return mapToDto(claim);
    }

    private void verifyClaimAccess(Claim claim, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> !a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isStaff) {
            String ownerEmail = claim.getSubmittedBy().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to access this claim");
            }
        }
    }

    private ClaimDto mapToDto(Claim claim) {
        ClaimDto dto = new ClaimDto();
        dto.setId(claim.getId());
        dto.setPolicyId(claim.getPolicy().getId());
        dto.setPolicyType(claim.getPolicy().getPolicyType().name());
        dto.setVehicleRegNo(claim.getPolicy().getVehicle().getRegistrationNo());
        dto.setSubmittedBy(claim.getSubmittedBy().getName());
        dto.setDescription(claim.getDescription());
        dto.setAmount(claim.getAmount());
        dto.setStatus(claim.getStatus());
        dto.setReviewerNotes(claim.getReviewerNotes());
        dto.setSubmittedDate(claim.getSubmittedDate());
        return dto;
    }
}
