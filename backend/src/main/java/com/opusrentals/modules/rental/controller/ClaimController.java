package com.opusrentals.modules.rental.controller;

import com.opusrentals.modules.rental.dto.request.CreateClaimRequest;
import com.opusrentals.modules.rental.dto.request.ResolveClaimRequest;
import com.opusrentals.modules.rental.dto.response.ClaimResponse;
import com.opusrentals.modules.rental.service.ClaimService;
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
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Rental Claims & Warranties", description = "Endpoints for reporting issues, warranties, damage and refund requests")
public class ClaimController {

    private final ClaimService claimService;

    @PostMapping("/rentals/{rentalId}/claims")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    @Operation(summary = "Create claim, warranty or refund request for a rental (Client only)")
    public ResponseEntity<ApiResponse<ClaimResponse>> createClaim(
            @PathVariable Long rentalId,
            @Valid @RequestBody CreateClaimRequest request,
            Authentication authentication) {
        ClaimResponse response = claimService.createClaim(rentalId, authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Novedad o reclamación radicada exitosamente", response));
    }

    @GetMapping("/rentals/{rentalId}/claims")
    @PreAuthorize("hasAnyAuthority('ROLE_CLIENT', 'ROLE_PROVIDER', 'ROLE_ADMIN')")
    @Operation(summary = "Get all claims associated with a rental")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getClaimsByRental(
            @PathVariable Long rentalId,
            Authentication authentication) {
        List<ClaimResponse> responses = claimService.getClaimsByRental(rentalId, authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Reclamaciones del alquiler obtenidas exitosamente", responses));
    }

    @GetMapping("/claims/my-claims")
    @PreAuthorize("hasAuthority('ROLE_CLIENT')")
    @Operation(summary = "List claims made by the authenticated client")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getMyClaims(Authentication authentication) {
        List<ClaimResponse> responses = claimService.getMyClaims(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Mis reclamaciones obtenidas exitosamente", responses));
    }

    @GetMapping("/claims/provider")
    @PreAuthorize("hasAuthority('ROLE_PROVIDER')")
    @Operation(summary = "List claims received for the provider's tools")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getProviderClaims(Authentication authentication) {
        List<ClaimResponse> responses = claimService.getProviderClaims(authentication.getName());
        return ResponseEntity.ok(ApiResponse.ok("Reclamaciones de flota obtenidas exitosamente", responses));
    }

    @GetMapping("/claims/admin")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List all claims platform-wide (Admin only)")
    public ResponseEntity<ApiResponse<List<ClaimResponse>>> getAllClaims() {
        List<ClaimResponse> responses = claimService.getAllClaims();
        return ResponseEntity.ok(ApiResponse.ok("Todas las reclamaciones de la plataforma obtenidas", responses));
    }

    @PatchMapping("/claims/{claimId}/resolve")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @Operation(summary = "Resolve or update claim status (Provider or Admin)")
    public ResponseEntity<ApiResponse<ClaimResponse>> resolveClaim(
            @PathVariable Long claimId,
            @Valid @RequestBody ResolveClaimRequest request,
            Authentication authentication) {
        ClaimResponse response = claimService.resolveClaim(claimId, authentication.getName(), request);
        return ResponseEntity.ok(ApiResponse.ok("Reclamación actualizada exitosamente", response));
    }
}
