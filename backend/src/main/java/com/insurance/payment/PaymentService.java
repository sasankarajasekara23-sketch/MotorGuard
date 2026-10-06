package com.insurance.payment;

import com.insurance.audit.AuditService;
import com.insurance.claim.Claim;
import com.insurance.claim.ClaimRepository;
import com.insurance.claim.ClaimStatus;
import com.insurance.claim.state.ClaimStateFactory;
import com.insurance.common.BusinessRuleException;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.payment.dto.ClaimPayoutRequest;
import com.insurance.payment.dto.PaymentDto;
import com.insurance.payment.dto.PremiumPaymentRequest;
import com.insurance.payment.enums.PaymentMethod;
import com.insurance.payment.enums.PaymentStatus;
import com.insurance.payment.enums.PaymentType;
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
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PolicyRepository policyRepository;
    private final ClaimRepository claimRepository;
    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final AuditService auditService;

    @Transactional
    public PaymentDto processPremiumPayment(String callerEmail, PremiumPaymentRequest request, Authentication auth) {
        User user = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Policy policy = policyRepository.findById(request.getPolicyId())
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        // Ownership verification: Customers may only pay premiums for their own policies
        if (isCustomer(auth)) {
            String ownerEmail = policy.getVehicle().getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(callerEmail)) {
                throw new AccessDeniedException("You can only pay premiums for your own policies");
            }
        }

        // Amount validation: Must match policy premium amount exactly
        if (request.getAmount().compareTo(policy.getPremiumAmount()) != 0) {
            throw new IllegalArgumentException("Payment amount (" + request.getAmount() +
                    ") does not match policy premium amount (" + policy.getPremiumAmount() + ")");
        }

        // Duplicate payment prevention
        if (paymentRepository.existsByPolicyIdAndPaymentTypeAndStatus(
                policy.getId(), PaymentType.PREMIUM_PAYMENT, PaymentStatus.SUCCESSFUL)) {
            throw new BusinessRuleException("A successful premium payment has already been recorded for this policy.");
        }

        Payment payment = new Payment();
        payment.setTransactionRef(generateRef("TXN"));
        payment.setPaymentType(PaymentType.PREMIUM_PAYMENT);
        payment.setAmount(policy.getPremiumAmount());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.SUCCESSFUL);
        payment.setPolicy(policy);
        payment.setClaim(null);
        payment.setCustomer(policy.getVehicle().getCustomer());
        payment.setProcessedBy(user);
        payment.setNotes(request.getNotes());
        payment.setPaymentDate(LocalDateTime.now());

        policy.setStatus(PolicyStatus.ACTIVE);
        policyRepository.save(policy);

        Payment savedPayment = paymentRepository.save(payment);

        auditService.logAction(user, "PAID_POLICY_PREMIUM", "Policy", policy.getId().toString());

        return mapToDto(savedPayment);
    }

    @Transactional
    public PaymentDto processClaimPayout(String callerEmail, ClaimPayoutRequest request, Authentication auth) {
        User user = userRepository.findByEmail(callerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Claim claim = claimRepository.findById(request.getClaimId())
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        Payment payment = executeClaimPayout(claim, user, request.getPaymentMethod(), request.getNotes());
        return mapToDto(payment);
    }

    @Transactional
    public Payment executeClaimPayout(Claim claim, User processedBy, PaymentMethod paymentMethod, String notes) {
        // The claim's current state decides whether it can be paid (APPROVED only)
        ClaimStatus paidStatus = ClaimStateFactory.of(claim.getStatus()).pay();

        // Duplicate payout prevention
        if (paymentRepository.existsByClaimIdAndStatus(claim.getId(), PaymentStatus.SUCCESSFUL)) {
            throw new BusinessRuleException("Claim has already been paid and payout recorded.");
        }

        Payment payment = new Payment();
        payment.setTransactionRef(generateRef("PAYOUT"));
        payment.setPaymentType(PaymentType.CLAIM_PAYOUT);
        payment.setAmount(claim.getAmount());
        payment.setPaymentMethod(paymentMethod != null ? paymentMethod : PaymentMethod.BANK_TRANSFER);
        payment.setStatus(PaymentStatus.SUCCESSFUL);
        payment.setPolicy(claim.getPolicy());
        payment.setClaim(claim);
        payment.setCustomer(claim.getPolicy().getVehicle().getCustomer());
        payment.setProcessedBy(processedBy);
        payment.setNotes(notes != null ? notes : "Claim settlement payout");
        payment.setPaymentDate(LocalDateTime.now());

        claim.setStatus(paidStatus);
        claimRepository.save(claim);

        Payment savedPayment = paymentRepository.save(payment);

        auditService.logAction(processedBy, "DISBURSED_CLAIM_PAYOUT", "Claim", claim.getId().toString());

        return savedPayment;
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByCustomerEmail(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        return paymentRepository.findByCustomerIdOrderByPaymentDateDesc(customer.getId()).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentDto getPaymentById(UUID id, Authentication auth) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));

        if (isCustomer(auth)) {
            String ownerEmail = payment.getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to access this payment");
            }
        }

        return mapToDto(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getAllPayments() {
        return paymentRepository.findAllByOrderByPaymentDateDesc().stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByPolicyId(UUID policyId, Authentication auth) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        if (isCustomer(auth)) {
            String ownerEmail = policy.getVehicle().getCustomer().getUser().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to view payments for this policy");
            }
        }

        return paymentRepository.findByPolicyIdOrderByPaymentDateDesc(policyId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<PaymentDto> getPaymentsByClaimId(UUID claimId, Authentication auth) {
        Claim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Claim not found"));

        if (isCustomer(auth)) {
            String ownerEmail = claim.getSubmittedBy().getEmail();
            if (!ownerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to view payments for this claim");
            }
        }

        return paymentRepository.findByClaimIdOrderByPaymentDateDesc(claimId).stream()
                .map(this::mapToDto).collect(Collectors.toList());
    }

    private String generateRef(String prefix) {
        String datePart = DateTimeFormatter.ofPattern("yyyyMMdd").format(LocalDate.now());
        String randomPart = UUID.randomUUID().toString().replace("-", "").substring(0, 8).toUpperCase();
        return prefix + "-" + datePart + "-" + randomPart;
    }

    private boolean isCustomer(Authentication auth) {
        if (auth == null) return false;
        return auth.getAuthorities().stream()
                .allMatch(a -> a.getAuthority().equals("ROLE_CUSTOMER"));
    }

    public PaymentDto mapToDto(Payment payment) {
        PaymentDto dto = new PaymentDto();
        dto.setId(payment.getId());
        dto.setTransactionRef(payment.getTransactionRef());
        dto.setPaymentType(payment.getPaymentType());
        dto.setAmount(payment.getAmount());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus());
        dto.setPolicyId(payment.getPolicy() != null ? payment.getPolicy().getId() : null);
        dto.setClaimId(payment.getClaim() != null ? payment.getClaim().getId() : null);
        dto.setCustomerId(payment.getCustomer().getId());
        dto.setCustomerName(payment.getCustomer().getUser().getName());
        dto.setProcessedByUserId(payment.getProcessedBy().getId());
        dto.setProcessedByUserName(payment.getProcessedBy().getName());
        dto.setNotes(payment.getNotes());
        dto.setPaymentDate(payment.getPaymentDate());
        return dto;
    }
}
