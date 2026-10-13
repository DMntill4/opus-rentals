package com.opusrentals.modules.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {

    private long totalUsers;
    private long totalClients;
    private long totalProviders;
    private long totalTools;
    private long totalRentals;
    private long activeRentals;
    private BigDecimal totalRevenue;
    private BigDecimal pendingRevenue;
    private long reportedDamages;

    private List<MonthlyRevenueResponse> revenueHistory;
    private List<TopToolResponse> topRentedTools;
}
