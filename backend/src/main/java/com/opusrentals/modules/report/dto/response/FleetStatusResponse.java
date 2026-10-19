package com.opusrentals.modules.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FleetStatusResponse {
    private long totalTools;
    private long availableCount;
    private long rentedCount;
    private long maintenanceCount;
    private long retiredCount;
    private double utilizationRatePercentage;
    private Map<String, Long> statusBreakdown;
    private List<CategoryFleetMetricResponse> categoryBreakdown;
}
