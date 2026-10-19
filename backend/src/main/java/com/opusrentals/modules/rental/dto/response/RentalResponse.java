package com.opusrentals.modules.rental.dto.response;

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
public class RentalResponse {

    private Long id;
    private Long clientId;
    private String clientFullName;
    private String clientPhone;
    private Long toolId;
    private String toolName;
    private String toolBrand;
    private String toolModel;
    private String toolCoverImageUrl;
    private Long providerId;
    private String providerCompanyName;

    private LocalDate startDate;
    private LocalDate endDate;
    private Integer totalDays;
    private Integer quantity;
    private BigDecimal dailyRate;
    private BigDecimal subtotal;
    private BigDecimal depositAmount;
    private BigDecimal estimatedTotal; // subtotal + 19% tax + deposit
    private BigDecimal totalAmount;    // subtotal + 19% tax (invoice value)
    private String status;
    private String notes;
    private LocalDateTime createdAt;

    // Attached invoice information if available
    private Long invoiceId;
    private String invoiceNumber;
    private String invoiceStatus;
}
