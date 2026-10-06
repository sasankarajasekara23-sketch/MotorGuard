package com.insurance.customer;

import com.insurance.common.BusinessRuleException;
import com.insurance.common.ResourceNotFoundException;
import com.insurance.customer.dto.CustomerDto;
import com.insurance.customer.dto.ProfileUpdateResponse;
import com.insurance.customer.dto.UpdateCustomerRequest;
import com.insurance.security.JwtUtil;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final UserRepository userRepository;
    private final UserDetailsService userDetailsService;
    private final JwtUtil jwtUtil;

    public CustomerDto getCustomerByEmail(String email) {
        Customer customer = customerRepository.findByUserEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found for email: " + email));
        return mapToDto(customer);
    }

    public CustomerDto getCustomerById(UUID id, Authentication auth) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        verifyCustomerAccess(customer, auth);
        return mapToDto(customer);
    }
    
    public List<CustomerDto> getAllCustomers() {
        return customerRepository.findAll().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }
    
    /**
     * Self-service profile update. Unlike updateCustomerById, this reissues a
     * JWT: email doubles as the login identifier, so if it changed, the
     * caller's existing token would stop resolving to their own account on
     * their very next request.
     */
    @Transactional
    public ProfileUpdateResponse updateMyProfile(String currentEmail, UpdateCustomerRequest request) {
        Customer customer = customerRepository.findByUserEmail(currentEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));

        applyProfileUpdate(customer, request);
        Customer updated = customerRepository.save(customer);

        UserDetails userDetails = userDetailsService.loadUserByUsername(updated.getUser().getEmail());
        String token = jwtUtil.generateToken(userDetails, updated.getUser().getRole().name());

        return new ProfileUpdateResponse(mapToDto(updated), token);
    }

    @Transactional
    public CustomerDto updateCustomerById(UUID id, UpdateCustomerRequest request, Authentication auth) {
        Customer customer = customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found"));
        verifyCustomerAccess(customer, auth);

        applyProfileUpdate(customer, request);
        Customer updated = customerRepository.save(customer);
        return mapToDto(updated);
    }

    private void applyProfileUpdate(Customer customer, UpdateCustomerRequest request) {
        User user = customer.getUser();

        if (!user.getEmail().equalsIgnoreCase(request.getEmail())
                && userRepository.existsByEmailAndIdNot(request.getEmail(), user.getId())) {
            throw new BusinessRuleException("Email is already in use by another account.");
        }
        if (!customer.getNationalId().equalsIgnoreCase(request.getNationalId())
                && customerRepository.existsByNationalIdAndIdNot(request.getNationalId(), customer.getId())) {
            throw new BusinessRuleException("National ID is already registered to another account.");
        }

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        userRepository.save(user);

        customer.setNationalId(request.getNationalId());
        customer.setPhone(request.getPhone());
        customer.setAddress(request.getAddress());
    }

    private void verifyCustomerAccess(Customer customer, Authentication auth) {
        if (auth == null) {
            throw new AccessDeniedException("Authentication required");
        }
        boolean isStaff = auth.getAuthorities().stream()
                .anyMatch(a -> !a.getAuthority().equals("ROLE_CUSTOMER"));
        if (!isStaff) {
            String customerEmail = customer.getUser().getEmail();
            if (!customerEmail.equalsIgnoreCase(auth.getName())) {
                throw new AccessDeniedException("You do not have permission to access or modify this customer profile");
            }
        }
    }
    
    private CustomerDto mapToDto(Customer customer) {
        CustomerDto dto = new CustomerDto();
        dto.setId(customer.getId());
        dto.setUserId(customer.getUser().getId());
        dto.setName(customer.getUser().getName());
        dto.setEmail(customer.getUser().getEmail());
        dto.setPhone(customer.getPhone());
        dto.setAddress(customer.getAddress());
        dto.setNationalId(customer.getNationalId());
        return dto;
    }
}
