package com.opusrentals.modules.rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ClaimResponse {

    private Long id;
    private Long rentalId;
    private Long clientId;
    private String clientFullName;
    private String clientPhone;
    private Long toolId;
    private String toolName;
    private Long providerId;
    private String providerCompanyName;

    private String claimType;
    private String reason;
    private String description;
    private String requestedAction;
    private String status;
    private BigDecimal refundAmount;
    private String resolutionNotes;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;
}
