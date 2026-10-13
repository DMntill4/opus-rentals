package com.opusrentals.modules.billing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {

    private Long id;
    private Long rentalId;
    private String invoiceNumber;
    private LocalDate issueDate;
    private BigDecimal subtotal;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime createdAt;

    // Rental details
    private String clientFullName;
    private String clientEmail;
    private String clientDocument;
    private String toolName;
    private String providerCompanyName;
    private Integer totalDays;
    private BigDecimal dailyRate;
}
