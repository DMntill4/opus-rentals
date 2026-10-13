package com.opusrentals.modules.billing.service;

import com.opusrentals.modules.billing.dto.response.InvoiceResponse;
import com.opusrentals.modules.billing.entity.Invoice;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;

    @Transactional
    public Invoice createInvoiceForRental(Rental rental) {
        Optional<Invoice> existing = invoiceRepository.findByRentalId(rental.getId());
        if (existing.isPresent()) {
            return existing.get();
        }

        BigDecimal subtotal = rental.getSubtotal();
        BigDecimal taxAmount = subtotal.multiply(new BigDecimal("0.19")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalAmount = subtotal.add(taxAmount);

        String invoiceNumber = "INV-" + Year.now().getValue() + "-" +
                UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Invoice invoice = Invoice.builder()
                .rental(rental)
                .invoiceNumber(invoiceNumber)
                .issueDate(LocalDate.now())
                .subtotal(subtotal)
                .taxAmount(taxAmount)
                .totalAmount(totalAmount)
                .status("ISSUED")
                .build();

        return invoiceRepository.save(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceById(Long id) {
        Invoice invoice = invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada con ID: " + id));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public InvoiceResponse getInvoiceByRentalId(Long rentalId) {
        Invoice invoice = invoiceRepository.findByRentalId(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Factura no encontrada para el alquiler ID: " + rentalId));
        return mapToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByClientId(Long clientId) {
        return invoiceRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InvoiceResponse> getInvoicesByProviderId(Long providerId) {
        return invoiceRepository.findByProviderId(providerId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public InvoiceResponse mapToResponse(Invoice invoice) {
        Rental r = invoice.getRental();
        String clientName = r.getClient().getFirstName() + " " + r.getClient().getLastName();
        String clientDoc = r.getClient().getDocumentType() + " " + r.getClient().getDocumentNumber();

        return InvoiceResponse.builder()
                .id(invoice.getId())
                .rentalId(r.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .issueDate(invoice.getIssueDate())
                .subtotal(invoice.getSubtotal())
                .taxAmount(invoice.getTaxAmount())
                .totalAmount(invoice.getTotalAmount())
                .status(invoice.getStatus())
                .createdAt(invoice.getCreatedAt())
                .clientFullName(clientName)
                .clientEmail(r.getClient().getUser().getEmail())
                .clientDocument(clientDoc)
                .toolName(r.getTool().getName())
                .providerCompanyName(r.getTool().getProvider().getCompanyName())
                .totalDays(r.getTotalDays())
                .dailyRate(r.getDailyRate())
                .build();
    }
}
