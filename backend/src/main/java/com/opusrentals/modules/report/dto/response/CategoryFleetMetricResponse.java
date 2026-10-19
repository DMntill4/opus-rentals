package com.opusrentals.modules.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryFleetMetricResponse {
    private Long categoryId;
    private String categoryName;
    private long totalTools;
    private long availableTools;
    private long rentedTools;
    private long maintenanceTools;
    private long retiredTools;
}
