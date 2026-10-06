package com.insurance.claim;

import com.insurance.claim.dto.ClaimRequest;
import com.insurance.claim.dto.ClaimUpdateRequest;
import com.insurance.common.BusinessRuleException;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.policy.Policy;
import com.insurance.policy.PolicyRepository;
import com.insurance.policy.PolicyStatus;
import com.insurance.policy.PolicyType;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import com.insurance.vehicle.Vehicle;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;
import java.util.UUID;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class ClaimServiceTest {

    @Mock private ClaimRepository claimRepository;
    @Mock private PolicyRepository policyRepository;
    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;

    @InjectMocks
    private ClaimService claimService;

    private Customer customer(String name, String email) {
        User user = new User();
        user.setId(UUID.randomUUID());
        user.setName(name);
        user.setEmail(email);
        Customer c = new Customer();
        c.setId(UUID.randomUUID());
        c.setUser(user);
        return c;
    }

    private Policy policyFor(Customer owner, PolicyStatus status) {
        Vehicle v = new Vehicle();
        v.setRegistrationNo("ABC-123");
        v.setCustomer(owner);

        Policy p = new Policy();
        p.setId(UUID.randomUUID());
        p.setPolicyType(PolicyType.BASIC);
        p.setVehicle(v);
        p.setStatus(status);
        p.setStartDate(LocalDate.now().minusDays(10));
        p.setEndDate(LocalDate.now().plusDays(300));
        return p;
    }

    private ClaimRequest requestFor(Policy p) {
        ClaimRequest req = new ClaimRequest();
        req.setPolicyId(p.getId());
        req.setDescription("Accident");
        req.setAmount(new BigDecimal("1000"));
        return req;
    }

    private Claim claimOwnedBy(Customer owner, ClaimStatus status) {
        Claim c = new Claim();
        c.setId(UUID.randomUUID());
        c.setSubmittedBy(owner.getUser());
        c.setStatus(status);
        return c;
    }

    @Test
    void submitClaim_Success() {
        Customer owner = customer("Test", "test@test.com");
        Policy p = policyFor(owner, PolicyStatus.ACTIVE);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(owner.getUser()));
        when(policyRepository.findById(p.getId())).thenReturn(Optional.of(p));
        when(customerRepository.findByUserEmail("test@test.com")).thenReturn(Optional.of(owner));
        when(claimRepository.save(any())).thenAnswer(i -> {
            Claim c = (Claim) i.getArguments()[0];
            c.setId(UUID.randomUUID());
            return c;
        });

        var res = claimService.submitClaim("test@test.com", requestFor(p));

        assertEquals("Accident", res.getDescription());
        assertEquals(ClaimStatus.SUBMITTED, res.getStatus());
    }

    @Test
    void submitClaim_AgainstAnotherCustomersPolicy_IsDenied() {
        Customer owner = customer("Owner", "owner@test.com");
        Customer intruder = customer("Intruder", "intruder@test.com");
        Policy p = policyFor(owner, PolicyStatus.ACTIVE);

        when(userRepository.findByEmail("intruder@test.com")).thenReturn(Optional.of(intruder.getUser()));
        when(policyRepository.findById(p.getId())).thenReturn(Optional.of(p));
        when(customerRepository.findByUserEmail("intruder@test.com")).thenReturn(Optional.of(intruder));

        assertThrows(AccessDeniedException.class,
                () -> claimService.submitClaim("intruder@test.com", requestFor(p)));
        verify(claimRepository, never()).save(any());
    }

    @Test
    void submitClaim_OnExpiredPolicy_IsRejected() {
        Customer owner = customer("Test", "test@test.com");
        Policy p = policyFor(owner, PolicyStatus.EXPIRED);

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(owner.getUser()));
        when(policyRepository.findById(p.getId())).thenReturn(Optional.of(p));
        when(customerRepository.findByUserEmail("test@test.com")).thenReturn(Optional.of(owner));

        assertThrows(BusinessRuleException.class,
                () -> claimService.submitClaim("test@test.com", requestFor(p)));
    }

    @Test
    void deleteClaim_AlreadyPaid_IsRejected() {
        Customer owner = customer("Test", "test@test.com");
        Claim paid = claimOwnedBy(owner, ClaimStatus.PAID);
        when(claimRepository.findById(paid.getId())).thenReturn(Optional.of(paid));

        assertThrows(BusinessRuleException.class,
                () -> claimService.deleteClaim(paid.getId(), "test@test.com"));
        verify(claimRepository, never()).delete(any());
    }

    @Test
    void updateClaim_ByAnotherCustomer_IsDenied() {
        Customer owner = customer("Owner", "owner@test.com");
        Claim claim = claimOwnedBy(owner, ClaimStatus.SUBMITTED);
        when(claimRepository.findById(claim.getId())).thenReturn(Optional.of(claim));

        ClaimUpdateRequest update = new ClaimUpdateRequest();
        update.setDescription("Changed");
        update.setAmount(new BigDecimal("5"));

        assertThrows(AccessDeniedException.class,
                () -> claimService.updateClaim(claim.getId(), "intruder@test.com", update));
        verify(claimRepository, never()).save(any());
    }
}
