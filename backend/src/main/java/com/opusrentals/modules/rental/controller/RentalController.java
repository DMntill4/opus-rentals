package com.opusrentals.modules.rental.controller;

import com.opusrentals.modules.rental.dto.request.CreateRentalRequest;
import com.opusrentals.modules.rental.dto.request.ProcessRentalStatusRequest;
import com.opusrentals.modules.rental.dto.response.RentalResponse;
import com.opusrentals.modules.rental.service.RentalService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/rentals")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Rentals & Bookings", description = "Endpoints for equipment reservations, approval workflow, and rental tracking")
public class RentalController {

    private final RentalService rentalService;

    @PostMapping
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_CLIENTE', 'ROLE_ADMIN')")
    @Operation(summary = "Create a rental booking", description = "Checks tool availability, calculates fees, and reserves equipment")
    public ResponseEntity<ApiResponse<RentalResponse>> createRental(
            @Valid @RequestBody CreateRentalRequest request,
            Authentication authentication) {
        RentalResponse response = rentalService.createRental(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Reserva creada exitosamente", response));
    }

    @GetMapping("/my-rentals")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_CLIENTE', 'ROLE_ADMIN')")
    @Operation(summary = "Get client rental history", description = "Returns all rentals placed by the currently logged-in client")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getClientRentals(Authentication authentication) {
        List<RentalResponse> rentals = rentalService.getRentalsByClient(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping("/client/{clientId}")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_CLIENTE', 'ROLE_ADMIN')")
    @Operation(summary = "Get client rentals by client ID")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getRentalsByClientId(@PathVariable Long clientId) {
        List<RentalResponse> rentals = rentalService.getRentalsByClientId(clientId);
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping("/provider-requests")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_PROVEEDOR', 'ROLE_ADMIN')")
    @Operation(summary = "Get provider rental requests", description = "Returns all incoming rental requests for the provider's inventory")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getProviderRentals(Authentication authentication) {
        List<RentalResponse> rentals = rentalService.getRentalsByProvider(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all system rentals (Admin only)")
    public ResponseEntity<ApiResponse<List<RentalResponse>>> getAllRentals() {
        List<RentalResponse> rentals = rentalService.getAllRentals();
        return ResponseEntity.ok(ApiResponse.ok(rentals));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get rental details by ID")
    public ResponseEntity<ApiResponse<RentalResponse>> getRentalById(@PathVariable Long id) {
        RentalResponse response = rentalService.getRentalById(id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update rental status", description = "Allows provider to approve/reject, client to cancel, or admin to update")
    public ResponseEntity<ApiResponse<RentalResponse>> updateRentalStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProcessRentalStatusRequest request,
            Authentication authentication) {
        RentalResponse response = rentalService.updateRentalStatus(id, authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Estado de la reserva actualizado exitosamente", response));
    }
}
