package com.opusrentals.modules.user.controller;

import com.opusrentals.modules.user.dto.request.UpdateClientRequest;
import com.opusrentals.modules.user.dto.response.ClientResponse;
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
@RequestMapping("/api/v1/clients")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Clients Management", description = "CRUD endpoints for client profile management")
public class ClientController {

    private final UserService userService;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List all registered clients (Admin only)")
    public ResponseEntity<ApiResponse<List<ClientResponse>>> getAllClients() {
        List<ClientResponse> clients = userService.getAllClientResponses();
        return ResponseEntity.ok(ApiResponse.ok(clients));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_ADMIN')")
    @Operation(summary = "Get client details by ID")
    public ResponseEntity<ApiResponse<ClientResponse>> getClientById(@PathVariable Long id) {
        ClientResponse client = userService.getClientResponseById(id);
        return ResponseEntity.ok(ApiResponse.ok(client));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_ADMIN')")
    @Operation(summary = "Update client profile (Self or Admin)")
    public ResponseEntity<ApiResponse<ClientResponse>> updateClient(
            @PathVariable Long id,
            @Valid @RequestBody UpdateClientRequest request,
            Authentication authentication) {
        ClientResponse updated = userService.updateClient(id, authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Perfil de cliente actualizado exitosamente", updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Delete or deactivate client (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteClient(@PathVariable Long id) {
        userService.deleteClient(id);
        return ResponseEntity.ok(ApiResponse.ok("Cliente eliminado o desactivado exitosamente", null));
    }
}
