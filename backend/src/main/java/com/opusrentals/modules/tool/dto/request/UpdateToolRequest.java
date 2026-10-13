package com.opusrentals.modules.tool.dto.request;

import jakarta.validation.constraints.DecimalMin;
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
public class UpdateToolRequest {

    private Long categoryId;
    private String name;
    private String brand;
    private String model;

    @DecimalMin(value = "0.01", message = "El precio diario debe ser mayor a 0")
    private BigDecimal dailyPrice;

    @DecimalMin(value = "0.00", message = "El depósito no puede ser negativo")
    private BigDecimal depositAmount;

    private String status; // AVAILABLE, RENTED, MAINTENANCE, RETIRED

    private List<CreateToolRequest.ImageItem> images;
    private List<CreateToolRequest.SpecificationItem> specifications;
}
