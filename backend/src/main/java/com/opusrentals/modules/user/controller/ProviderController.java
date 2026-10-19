package com.opusrentals.modules.user.controller;

import com.opusrentals.modules.user.dto.request.UpdateProviderRequest;
import com.opusrentals.modules.user.dto.response.ProviderResponse;
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
@RequestMapping("/api/v1/providers")
@RequiredArgsConstructor
@Tag(name = "Providers Management", description = "CRUD endpoints for equipment providers and suppliers")
public class ProviderController {

    private final UserService userService;

    @GetMapping
    @Operation(summary = "List all equipment providers", description = "Returns active machinery suppliers with coverage zones and contacts")
    public ResponseEntity<ApiResponse<List<ProviderResponse>>> getAllProviders() {
        List<ProviderResponse> providers = userService.getAllProviderResponses();
        return ResponseEntity.ok(ApiResponse.ok(providers));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get provider details by ID")
    public ResponseEntity<ApiResponse<ProviderResponse>> getProviderById(@PathVariable Long id) {
        ProviderResponse provider = userService.getProviderResponseById(id);
        return ResponseEntity.ok(ApiResponse.ok(provider));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Update provider corporate info, contacts, and coverage zones (Owner Provider or Admin)")
    public ResponseEntity<ApiResponse<ProviderResponse>> updateProvider(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProviderRequest request,
            Authentication authentication) {
        ProviderResponse updated = userService.updateProvider(id, authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Perfil de proveedor actualizado exitosamente", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Delete or deactivate provider (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteProvider(@PathVariable Long id) {
        userService.deleteProvider(id);
        return ResponseEntity.ok(ApiResponse.ok("Proveedor eliminado o desactivado exitosamente", null));
    }
}
