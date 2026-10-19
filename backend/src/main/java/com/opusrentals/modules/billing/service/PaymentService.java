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
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final PaymentMethodRepository paymentMethodRepository;
    private final InvoiceRepository invoiceRepository;
    private final RentalRepository rentalRepository;
    private final ToolRepository toolRepository;

    @Transactional(readOnly = true)
    public List<PaymentMethodResponse> getActivePaymentMethods() {
        return paymentMethodRepository.findByIsActiveTrue().stream()
                .map(pm -> PaymentMethodResponse.builder()
                        .id(pm.getId())
                        .code(pm.getCode())
                        .name(pm.getName())
                        .isActive(pm.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse processPayment(ProcessPaymentRequest request) {
        Invoice invoice = invoiceRepository.findById(request.getInvoiceId())
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada con ID: " + request.getInvoiceId()));

        if ("PAID".equals(invoice.getStatus())) {
            throw new BadRequestException("La factura ya ha sido pagada previamente");
        }

        PaymentMethod method = paymentMethodRepository.findById(request.getPaymentMethodId())
                .orElseThrow(() -> new ResourceNotFoundException("Método de pago no válido"));

        if (!method.getIsActive()) {
            throw new BadRequestException("El método de pago seleccionado se encuentra inactivo");
        }

        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMddHHmmss"));
        String txnRef = "TXN-" + timestamp + "-" + method.getCode().substring(0, Math.min(4, method.getCode().length())) +
                "-" + UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        Payment payment = Payment.builder()
                .invoice(invoice)
                .paymentMethod(method)
                .transactionReference(txnRef)
                .amount(request.getAmount())
                .paymentDate(LocalDateTime.now())
                .paymentStatus("COMPLETED")
                .build();

        Payment savedPayment = paymentRepository.save(payment);

        // Update invoice status to PAID (Rental remains PENDING until provider approves)
        invoice.setStatus("PAID");
        invoiceRepository.save(invoice);

        return mapToResponse(savedPayment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getAllPayments() {
        return paymentRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));
        return mapToResponse(payment);
    }

    @Transactional
    public PaymentResponse refundPayment(Long id, String reason) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));

        if ("REFUNDED".equals(payment.getPaymentStatus())) {
            throw new BadRequestException("Este pago ya ha sido reembolsado previamente");
        }

        payment.setPaymentStatus("REFUNDED");
        Payment saved = paymentRepository.save(payment);

        Invoice invoice = payment.getInvoice();
        if (invoice != null) {
            invoice.setStatus("ISSUED");
            invoiceRepository.save(invoice);
        }

        return mapToResponse(saved);
    }

    @Transactional
    public void deletePayment(Long id) {
        Payment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Pago no encontrado con ID: " + id));

        Invoice invoice = payment.getInvoice();
        if (invoice != null && "PAID".equals(invoice.getStatus())) {
            invoice.setStatus("ISSUED");
            invoiceRepository.save(invoice);
        }

        paymentRepository.delete(payment);
    }

    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByInvoiceId(Long invoiceId) {
        return paymentRepository.findByInvoiceId(invoiceId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private PaymentResponse mapToResponse(Payment payment) {
        return PaymentResponse.builder()
                .id(payment.getId())
                .invoiceId(payment.getInvoice().getId())
                .invoiceNumber(payment.getInvoice().getInvoiceNumber())
                .paymentMethodId(payment.getPaymentMethod().getId())
                .paymentMethodName(payment.getPaymentMethod().getName())
                .transactionReference(payment.getTransactionReference())
                .amount(payment.getAmount())
                .paymentDate(payment.getPaymentDate())
                .paymentStatus(payment.getPaymentStatus())
                .createdAt(payment.getCreatedAt())
                .build();
    }
}
