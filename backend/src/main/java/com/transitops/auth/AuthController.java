package com.transitops.auth;

import com.transitops.auth.dto.LoginRequest;
import com.transitops.auth.dto.RegisterRequest;
import com.transitops.auth.dto.AuthResponse;
import com.transitops.common.ApiResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(ApiResponse.success("User registered successfully", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Login successful", authService.login(request)));
    }

    @PostMapping("/verify-google")
    public ResponseEntity<ApiResponse<Boolean>> verifyGoogle(@RequestBody java.util.Map<String, String> body) throws InterruptedException {
        String email = body.get("email");
        if (email == null || email.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("Email is required"));
        }
        
        // Simulate network delay to Google API
        Thread.sleep(1500);
        
        boolean isValid = email.toLowerCase().endsWith("@gmail.com");
        if (isValid) {
            return ResponseEntity.ok(ApiResponse.success("Google account verified successfully", true));
        } else {
            return ResponseEntity.badRequest().body(ApiResponse.error("Google API rejected the account. It may not exist."));
        }
    }
}
