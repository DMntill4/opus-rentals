package com.opusrentals.modules.billing.service;

import com.opusrentals.modules.billing.dto.request.ProcessPaymentRequest;
import com.opusrentals.modules.billing.dto.response.PaymentMethodResponse;
import com.opusrentals.modules.billing.dto.response.PaymentResponse;
import com.opusrentals.modules.billing.entity.Invoice;
import com.opusrentals.modules.billing.entity.Payment;
import com.opusrentals.modules.billing.entity.PaymentMethod;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.billing.repository.PaymentMethodRepository;
import com.opusrentals.modules.billing.repository.PaymentRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PaymentServiceUnitTest {

    @Mock
    private PaymentRepository paymentRepository;

    @Mock
    private PaymentMethodRepository paymentMethodRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @InjectMocks
    private PaymentService paymentService;

    private Invoice invoice;
    private PaymentMethod paymentMethod;
    private Payment payment;

    @BeforeEach
    void setUp() {
        invoice = Invoice.builder()
                .id(1L)
                .invoiceNumber("INV-2026-0001")
                .totalAmount(new BigDecimal("300000.00"))
                .status("ISSUED")
                .build();

        paymentMethod = PaymentMethod.builder()
                .id(1L)
                .code("CARD")
                .name("Tarjeta de Crédito / Débito")
                .isActive(true)
                .build();

        payment = Payment.builder()
                .id(10L)
                .invoice(invoice)
                .paymentMethod(paymentMethod)
                .transactionReference("TXN-TEST-1234")
                .amount(new BigDecimal("300000.00"))
                .paymentStatus("COMPLETED")
                .paymentDate(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("Should return all active payment methods")
    void testGetActivePaymentMethods() {
        when(paymentMethodRepository.findByIsActiveTrue()).thenReturn(List.of(paymentMethod));

        List<PaymentMethodResponse> result = paymentService.getActivePaymentMethods();

        assertEquals(1, result.size());
        assertEquals("CARD", result.get(0).getCode());
    }

    @Test
    @DisplayName("Should process payment successfully and mark invoice as PAID")
    void testProcessPaymentSuccess() {
        ProcessPaymentRequest request = ProcessPaymentRequest.builder()
                .invoiceId(1L)
                .paymentMethodId(1L)
                .amount(new BigDecimal("300000.00"))
                .build();

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice));
        when(paymentMethodRepository.findById(1L)).thenReturn(Optional.of(paymentMethod));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> {
            Payment p = inv.getArgument(0);
            p.setId(10L);
            return p;
        });

        PaymentResponse response = paymentService.processPayment(request);

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("COMPLETED", response.getPaymentStatus());
        assertEquals("PAID", invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(paymentRepository, times(1)).save(any(Payment.class));
    }

    @Test
    @DisplayName("Should throw BadRequestException if invoice is already PAID")
    void testProcessPaymentAlreadyPaid() {
        invoice.setStatus("PAID");
        ProcessPaymentRequest request = ProcessPaymentRequest.builder()
                .invoiceId(1L)
                .paymentMethodId(1L)
                .amount(new BigDecimal("300000.00"))
                .build();

        when(invoiceRepository.findById(1L)).thenReturn(Optional.of(invoice));

        assertThrows(BadRequestException.class, () -> paymentService.processPayment(request));
        verify(paymentRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should refund payment and revert invoice status to ISSUED")
    void testRefundPaymentSuccess() {
        invoice.setStatus("PAID");
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));
        when(paymentRepository.save(any(Payment.class))).thenAnswer(inv -> inv.getArgument(0));

        PaymentResponse response = paymentService.refundPayment(10L, "Cancelación solicitada por el cliente");

        assertNotNull(response);
        assertEquals("REFUNDED", response.getPaymentStatus());
        assertEquals("ISSUED", invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(paymentRepository, times(1)).save(payment);
    }

    @Test
    @DisplayName("Should delete payment and revert invoice status if it was paid")
    void testDeletePaymentRevertsInvoice() {
        invoice.setStatus("PAID");
        when(paymentRepository.findById(10L)).thenReturn(Optional.of(payment));

        paymentService.deletePayment(10L);

        assertEquals("ISSUED", invoice.getStatus());
        verify(invoiceRepository, times(1)).save(invoice);
        verify(paymentRepository, times(1)).delete(payment);
    }
}
