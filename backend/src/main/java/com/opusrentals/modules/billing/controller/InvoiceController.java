package com.opusrentals.modules.billing.controller;

import com.opusrentals.modules.billing.dto.response.InvoiceResponse;
import com.opusrentals.modules.billing.service.InvoiceService;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.dto.ApiResponse;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/invoices")
@RequiredArgsConstructor
@SecurityRequirement(name = "Bearer Authentication")
@Tag(name = "Billing & Invoices", description = "Endpoints for invoice consultation, fiscal records, and download")
public class InvoiceController {

    private final InvoiceService invoiceService;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;

    @GetMapping
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Get all invoices (Admin only)")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getAllInvoices() {
        List<InvoiceResponse> invoices = invoiceService.getAllInvoices();
        return ResponseEntity.ok(ApiResponse.ok(invoices));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get invoice by ID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceById(@PathVariable Long id) {
        InvoiceResponse invoice = invoiceService.getInvoiceById(id);
        return ResponseEntity.ok(ApiResponse.ok(invoice));
    }

    @GetMapping("/rental/{rentalId}")
    @Operation(summary = "Get invoice by rental ID")
    public ResponseEntity<ApiResponse<InvoiceResponse>> getInvoiceByRentalId(@PathVariable Long rentalId) {
        InvoiceResponse invoice = invoiceService.getInvoiceByRentalId(rentalId);
        return ResponseEntity.ok(ApiResponse.ok(invoice));
    }

    @GetMapping("/my-invoices")
    @Operation(summary = "Get invoices for the current user (Client or Provider)")
    public ResponseEntity<ApiResponse<List<InvoiceResponse>>> getMyInvoices(Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        List<InvoiceResponse> invoices;
        if ("ROLE_CLIENT".equals(user.getRole().getName())) {
            var client = clientRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Perfil de cliente no encontrado"));
            invoices = invoiceService.getInvoicesByClientId(client.getId());
        } else if ("ROLE_PROVIDER".equals(user.getRole().getName())) {
            var provider = providerRepository.findByUser(user)
                    .orElseThrow(() -> new ResourceNotFoundException("Perfil de proveedor no encontrado"));
            invoices = invoiceService.getInvoicesByProviderId(provider.getId());
        } else {
            invoices = invoiceService.getAllInvoices();
        }

        return ResponseEntity.ok(ApiResponse.ok(invoices));
    }
}
