package com.opusrentals.modules.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProviderQualityResponse {

    private Long providerId;
    private String providerName;
    private String taxId;
    private String city;
    private long totalRentals;
    private long returnedRentals;
    private double returnRatePercentage;
    private long damageReportsCount;
    private long warrantyClaimsCount;
    private long refundRequestsCount;
    private BigDecimal totalRefundAmount;
    private long activeToolsCount;
}
