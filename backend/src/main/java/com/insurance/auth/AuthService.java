package com.insurance.auth;

import com.insurance.auth.dto.AuthResponse;
import com.insurance.auth.dto.LoginRequest;
import com.insurance.auth.dto.RegisterRequest;
import com.insurance.customer.Customer;
import com.insurance.customer.CustomerRepository;
import com.insurance.security.JwtUtil;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final UserDetailsService userDetailsService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setCreatedAt(LocalDateTime.now());
        
        user = userRepository.save(user);

        if (request.getRole() == com.insurance.user.Role.CUSTOMER) {
            Customer customer = new Customer();
            customer.setUser(user);
            customer.setPhone(request.getPhone());
            customer.setAddress(request.getAddress());
            customer.setNationalId(request.getNationalId());
            customerRepository.save(customer);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getName());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
                
        UserDetails userDetails = userDetailsService.loadUserByUsername(user.getEmail());
        String token = jwtUtil.generateToken(userDetails, user.getRole().name());

        return new AuthResponse(token, user.getRole().name(), user.getEmail(), user.getName());
    }
}
