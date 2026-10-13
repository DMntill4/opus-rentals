package com.opusrentals.modules.user.controller;

import com.opusrentals.modules.user.dto.request.UpdateUserStatusRequest;
import com.opusrentals.modules.user.dto.response.UserProfileResponse;
import com.opusrentals.modules.user.service.UserService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Users & Profiles", description = "Endpoints for user management, profiles, and administration")
public class UserController {

    private final UserService userService;

    @GetMapping("/users/me")
    @Operation(summary = "Get current authenticated user profile")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getCurrentUser(Authentication authentication) {
        UserProfileResponse profile = userService.getUserByEmail(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(profile));
    }

    @GetMapping("/admin/users")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List all users (Admin only)")
    public ResponseEntity<ApiResponse<List<UserProfileResponse>>> getAllUsers() {
        List<UserProfileResponse> users = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Lista de usuarios obtenida exitosamente", users));
    }

    @GetMapping("/admin/users/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get user details by ID (Admin only)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> getUserById(@PathVariable Long id) {
        UserProfileResponse user = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok(user));
    }

    @PatchMapping("/admin/users/{id}/status")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Toggle user active status (Admin only)")
    public ResponseEntity<ApiResponse<UserProfileResponse>> toggleUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UpdateUserStatusRequest request) {
        UserProfileResponse updated = userService.toggleUserStatus(id, request.getIsActive());
        return ResponseEntity.ok(ApiResponse.ok("Estado del usuario actualizado exitosamente", updated));
    }
}
