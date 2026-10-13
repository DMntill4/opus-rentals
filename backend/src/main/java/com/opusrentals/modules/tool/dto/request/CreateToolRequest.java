package com.opusrentals.modules.tool.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
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
public class CreateToolRequest {

    @NotNull(message = "La categoría es obligatoria")
    private Long categoryId;

    @NotBlank(message = "El nombre de la herramienta es obligatorio")
    private String name;

    @NotBlank(message = "La marca es obligatoria")
    private String brand;

    @NotBlank(message = "El modelo es obligatorio")
    private String model;

    @NotNull(message = "El precio de alquiler diario es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio diario debe ser mayor a 0")
    private BigDecimal dailyPrice;

    @NotNull(message = "El valor del depósito de garantía es obligatorio")
    @DecimalMin(value = "0.00", message = "El depósito no puede ser negativo")
    private BigDecimal depositAmount;

    private List<ImageItem> images;
    private List<SpecificationItem> specifications;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageItem {
        private String imageUrl;
        private Boolean isCover;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecificationItem {
        private String specKey;
        private String specValue;
    }
}
