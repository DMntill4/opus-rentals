package com.opusrentals.modules.billing.controller;

import com.opusrentals.modules.billing.dto.request.ProcessPaymentRequest;
import com.opusrentals.modules.billing.dto.response.PaymentMethodResponse;
import com.opusrentals.modules.billing.dto.response.PaymentResponse;
import com.opusrentals.modules.billing.service.PaymentService;
import com.opusrentals.shared.dto.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
@RequiredArgsConstructor
@Tag(name = "Payments & Transactions", description = "Endpoints for payment methods and checkout processing")
public class PaymentController {

    private final PaymentService paymentService;

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
}
