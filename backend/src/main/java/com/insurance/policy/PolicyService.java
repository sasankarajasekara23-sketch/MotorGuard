package com.insurance.policy;

import com.insurance.common.BusinessRuleException;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.claim.ClaimRepository;
import com.insurance.payment.PaymentRepository;
import com.insurance.payment.enums.PaymentStatus;
import com.insurance.payment.enums.PaymentType;
import com.insurance.policy.dto.PolicyDto;
import com.insurance.policy.dto.PolicyRequest;
import com.insurance.policy.dto.PolicyUpdateRequest;
import com.insurance.vehicle.Vehicle;
import com.insurance.vehicle.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PolicyService {

    private final PolicyRepository policyRepository;
    private final VehicleRepository vehicleRepository;
    private final CustomerRepository customerRepository;
    private final ClaimRepository claimRepository;
    private final PaymentRepository paymentRepository;

    public List<PolicyDto> getPoliciesByCustomerId(UUID customerId) {
        return policyRepository.findByVehicleCustomerId(customerId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public List<PolicyDto> getAllPolicies() {
        return policyRepository.findAll().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    public PolicyDto getPolicyById(UUID id, Authentication auth) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        verifyPolicyAccess(policy, auth);
        return mapToDto(policy);
    }

    public PolicyDto getPolicyById(UUID id) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        return mapToDto(policy);
    }

    @Transactional
    public PolicyDto createPolicy(PolicyRequest request, Authentication auth) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        // Step 1 IDOR security fix — customers may only insure their own vehicles
        if (isCustomer(auth)) {
            String ownerEmail = vehicle.getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You can only create policies for your own vehicles");
            }
        }

        // Date validation — endDate must be strictly after startDate
        if (request.getStartDate() == null || request.getEndDate() == null) {
            throw new IllegalArgumentException("Start date and end date are required.");
        }
        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new IllegalArgumentException(
                    "Policy end date must be after the start date.");
        }

        // Active policy overlap prevention
        if (policyRepository.existsByVehicleIdAndStatus(vehicle.getId(), PolicyStatus.ACTIVE)) {
            throw new BusinessRuleException(
                    "This vehicle already has an active insurance policy. " +
                    "A vehicle cannot have more than one active policy at a time.");
        }

        Policy policy = new Policy();
        policy.setVehicle(vehicle);
        policy.setPolicyType(request.getPolicyType());
        policy.setStartDate(request.getStartDate());
        policy.setEndDate(request.getEndDate());
        policy.setPremiumAmount(calculatePremium(request.getPolicyType(), vehicle));
        policy.setStatus(PolicyStatus.ACTIVE);

        return mapToDto(policyRepository.save(policy));
    }

    @Transactional
    public PolicyDto renewPolicy(UUID id, Authentication auth) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        // Step 1 IDOR security fix — customers may only renew their own policies
        if (isCustomer(auth)) {
            String ownerEmail = policy.getVehicle().getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to renew this policy");
            }
        }

        policy.setStartDate(policy.getEndDate());
        policy.setEndDate(policy.getEndDate().plusYears(1));
        policy.setStatus(PolicyStatus.ACTIVE);
        policy.setPremiumAmount(calculatePremium(policy.getPolicyType(), policy.getVehicle()));

        return mapToDto(policyRepository.save(policy));
    }

    @Transactional
    public PolicyDto updatePolicy(UUID id, PolicyUpdateRequest request, Authentication auth) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        verifyPolicyAccess(policy, auth);

        if (hasSuccessfulPremiumPayment(id)) {
            throw new BusinessRuleException("Cannot edit a policy that has already been paid for.");
        }

        if (!request.getEndDate().isAfter(request.getStartDate())) {
            throw new IllegalArgumentException("Policy end date must be after the start date.");
        }

        policy.setPolicyType(request.getPolicyType());
        policy.setStartDate(request.getStartDate());
        policy.setEndDate(request.getEndDate());
        policy.setPremiumAmount(calculatePremium(request.getPolicyType(), policy.getVehicle()));

        return mapToDto(policyRepository.save(policy));
    }

    @Transactional
    public void deletePolicy(UUID id, Authentication auth) {
        Policy policy = policyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));
        verifyPolicyAccess(policy, auth);

        if (hasSuccessfulPremiumPayment(id)) {
            throw new BusinessRuleException("Cannot delete a policy that has already been paid for.");
        }

        if (claimRepository.existsByPolicyId(id)) {
            throw new BusinessRuleException("Cannot delete a policy that has claims filed against it.");
        }

        policyRepository.delete(policy);
    }

    private boolean hasSuccessfulPremiumPayment(UUID policyId) {
        return paymentRepository.existsByPolicyIdAndPaymentTypeAndStatus(
                policyId, PaymentType.PREMIUM_PAYMENT, PaymentStatus.SUCCESSFUL);
    }

    public BigDecimal calculatePremium(PolicyType type, Vehicle vehicle) {
        return switch (type) {
            case BASIC -> new BigDecimal("500.00");
            case COMPREHENSIVE -> new BigDecimal("1200.00");
            case THIRD_PARTY -> new BigDecimal("300.00");
        };
    }

    private void verifyPolicyAccess(Policy policy, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> !a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isStaff) {
            String ownerEmail = policy.getVehicle().getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to access this policy");
            }
        }
    }

    /** Returns true if the authenticated principal holds only the CUSTOMER role. */
    private boolean isCustomer(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .allMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }

    private PolicyDto mapToDto(Policy policy) {
        PolicyDto dto = new PolicyDto();
        dto.setId(policy.getId());
        dto.setVehicleId(policy.getVehicle().getId());
        dto.setVehicleRegNo(policy.getVehicle().getRegistrationNo());
        dto.setPolicyType(policy.getPolicyType());
        dto.setStartDate(policy.getStartDate());
        dto.setEndDate(policy.getEndDate());
        dto.setPremiumAmount(policy.getPremiumAmount());
        dto.setStatus(policy.getStatus());
        return dto;
    }
}
