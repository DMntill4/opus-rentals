package com.opusrentals.modules.rental.controller;

import com.opusrentals.modules.rental.dto.request.ProcessReturnRequest;
import com.opusrentals.modules.rental.dto.response.ReturnResponse;
import com.opusrentals.modules.rental.service.ReturnService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Returns & Damages", description = "Endpoints for equipment return inspection and damage penalty reports")
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping("/rental/{rentalId}")
    @PreAuthorize("hasAnyAuthority('ROLE_PROVIDER', 'ROLE_ADMIN')")
    @Operation(summary = "Process equipment return", description = "Certifies equipment return condition and registers damage penalization items if found")
    public ResponseEntity<ApiResponse<ReturnResponse>> processReturn(
            @PathVariable Long rentalId,
            @Valid @RequestBody ProcessReturnRequest request) {
        ReturnResponse response = returnService.processReturn(rentalId, request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Devolución procesada exitosamente", response));
    }

    @GetMapping("/rental/{rentalId}")
    @Operation(summary = "Get return and damage inspection report for a rental")
    public ResponseEntity<ApiResponse<ReturnResponse>> getReturnByRentalId(@PathVariable Long rentalId) {
        ReturnResponse response = returnService.getReturnByRentalId(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
