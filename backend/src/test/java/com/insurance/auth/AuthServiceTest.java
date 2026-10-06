package com.insurance.auth;

import com.insurance.auth.dto.AuthResponse;
import com.insurance.auth.dto.LoginRequest;
import com.insurance.auth.dto.RegisterRequest;
import com.insurance.customer.CustomerRepository;
import com.insurance.security.JwtUtil;
import com.insurance.user.Role;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.password.PasswordEncoder;
import java.util.Optional;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private CustomerRepository customerRepository;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private AuthenticationManager authenticationManager;
    @Mock private UserDetailsService userDetailsService;

    @InjectMocks
    private AuthService authService;

    @Test
    void register_Success() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@test.com");
        req.setPassword("pass");
        req.setName("Test");
        req.setRole(Role.CUSTOMER);
        
        when(userRepository.findByEmail(any())).thenReturn(Optional.empty());
        when(passwordEncoder.encode(any())).thenReturn("hashed");
        when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);
        when(jwtUtil.generateToken(any(), any())).thenReturn("token");
        when(userDetailsService.loadUserByUsername(any())).thenReturn(mock(UserDetails.class));

        AuthResponse res = authService.register(req);

        assertNotNull(res.getToken());
        assertEquals("test@test.com", res.getEmail());
    }

    @Test
    void register_DuplicateEmail() {
        RegisterRequest req = new RegisterRequest();
        req.setEmail("test@test.com");
        
        when(userRepository.findByEmail(any())).thenReturn(Optional.of(new User()));
        
        assertThrows(RuntimeException.class, () -> authService.register(req));
    }
}
