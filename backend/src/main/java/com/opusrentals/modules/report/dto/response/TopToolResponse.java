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
public class TopToolResponse {
    private Long toolId;
    private String toolName;
    private String categoryName;
    private String providerCompanyName;
    private long totalRentals;
    private BigDecimal generatedRevenue;
}
