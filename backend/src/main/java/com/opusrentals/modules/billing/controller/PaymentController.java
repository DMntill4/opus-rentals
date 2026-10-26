package com.opusrentals.modules.billing.controller;

import com.opusrentals.modules.billing.dto.request.ProcessPaymentRequest;
import com.opusrentals.modules.billing.dto.response.PaymentMethodResponse;
import com.opusrentals.modules.billing.dto.response.PaymentResponse;
import com.opusrentals.modules.billing.service.PaymentService;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.dto.ApiResponse;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Payments & Transactions", description = "Endpoints for payment methods and checkout processing")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;

    @GetMapping("/payment-methods")
    @Operation(summary = "Get active payment methods (Public)", description = "Lists credit cards, PSE, digital wallets, cash, etc.")
    public ResponseEntity<ApiResponse<List<PaymentMethodResponse>>> getPaymentMethods() {
        List<PaymentMethodResponse> methods = paymentService.getActivePaymentMethods();
        return ResponseEntity.ok(ApiResponse.ok(methods));
    }

    @PostMapping("/payments")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Process payment for an invoice", description = "Registers payment transaction and updates invoice status to PAID")
    public ResponseEntity<ApiResponse<PaymentResponse>> processPayment(@Valid @RequestBody ProcessPaymentRequest request) {
        PaymentResponse response = paymentService.processPayment(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Pago procesado exitosamente", response));
    }

    @GetMapping("/payments/invoice/{invoiceId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get payment history for an invoice")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByInvoice(@PathVariable Long invoiceId) {
        List<PaymentResponse> payments = paymentService.getPaymentsByInvoiceId(invoiceId);
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping("/pagos/cliente/{clientId}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get payment history for the authenticated client")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentsByClient(
            @PathVariable Long clientId,
            Authentication authentication) {
        User user = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Long authenticatedClientId = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de cliente no encontrado"))
                .getId();

        if (!authenticatedClientId.equals(clientId)) {
            throw new AccessDeniedException("No puedes consultar pagos de otro cliente");
        }

        return ResponseEntity.ok(ApiResponse.ok(paymentService.getPaymentsByClientId(clientId)));
    }

    @GetMapping("/payments")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "List all payments across platform (Admin only)")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        List<PaymentResponse> payments = paymentService.getAllPayments();
        return ResponseEntity.ok(ApiResponse.ok(payments));
    }

    @GetMapping("/payments/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @Operation(summary = "Get payment details by ID")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse payment = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.ok(payment));
    }

    @PatchMapping("/payments/{id}/refund")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Refund a payment transaction (Admin only)", description = "Marks payment as REFUNDED and reverts invoice status to ISSUED")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "Solicitud de reembolso aprobada") String reason) {
        PaymentResponse response = paymentService.refundPayment(id, reason);
        return ResponseEntity.ok(ApiResponse.ok("Pago reembolsado exitosamente", response));
    }

    @DeleteMapping("/payments/{id}")
    @SecurityRequirement(name = "Bearer Authentication")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    @Operation(summary = "Void/Delete payment record (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
        return ResponseEntity.ok(ApiResponse.ok("Registro de pago anulado exitosamente", null));
    }
}
