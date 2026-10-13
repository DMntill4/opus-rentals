package com.opusrentals.modules.user.controller;

import com.opusrentals.modules.user.dto.request.LoginRequest;
import com.opusrentals.modules.user.dto.request.RegisterClientRequest;
import com.opusrentals.modules.user.dto.request.RegisterProviderRequest;
import com.opusrentals.modules.user.dto.response.AuthResponse;
import com.opusrentals.modules.user.service.AuthService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for authentication, JWT issuance, and user onboarding")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Login and obtain JWT token", description = "Validates user credentials and returns JWT Bearer token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.ok("Inicio de sesión exitoso", response));
    }

    @PostMapping("/register/client")
    @Operation(summary = "Register a new client", description = "Creates a new client account with ROLE_CLIENT and returns JWT")
    public ResponseEntity<ApiResponse<AuthResponse>> registerClient(@Valid @RequestBody RegisterClientRequest request) {
        AuthResponse response = authService.registerClient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Cliente registrado exitosamente", response));
    }

    @PostMapping("/register/provider")
    @Operation(summary = "Register a new provider", description = "Creates a new equipment provider account with contacts and coverage zones")
    public ResponseEntity<ApiResponse<AuthResponse>> registerProvider(@Valid @RequestBody RegisterProviderRequest request) {
        AuthResponse response = authService.registerProvider(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Proveedor registrado exitosamente", response));
    }
}
