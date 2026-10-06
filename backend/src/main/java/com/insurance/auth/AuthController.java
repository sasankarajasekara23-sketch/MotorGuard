package com.insurance.auth;

import com.insurance.auth.dto.AuthResponse;
import com.insurance.auth.dto.LoginRequest;
import com.insurance.auth.dto.RegisterRequest;
import com.insurance.common.ApiResponse;
import com.insurance.user.User;
import com.insurance.user.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED)
                    .body(new ApiResponse<>(true, "Registration successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, e.getMessage(), null));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(new ApiResponse<>(true, "Login successful", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(new ApiResponse<>(false, "Invalid credentials", null));
        }
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getMe(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", user.getId());
        userData.put("name", user.getName());
        userData.put("email", user.getEmail());
        userData.put("role", user.getRole());
        
        return ResponseEntity.ok(new ApiResponse<>(true, "User info retrieved", userData));
    }
}
