package com.opusrentals.modules.tool.dto.request;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
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

    private Long providerId;

    @NotBlank(message = "El nombre de la maquinaria es obligatorio")
    @Size(min = 5, max = 150, message = "El nombre de la maquinaria debe tener entre 5 y 150 caracteres descriptivos")
    @Pattern(regexp = "^.*[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ].*$", message = "El nombre de la maquinaria debe contener letras descriptivas")
    private String name;

    @NotBlank(message = "La marca es obligatoria")
    @Size(min = 2, max = 50, message = "La marca debe tener entre 2 y 50 caracteres")
    private String brand;

    @NotBlank(message = "El modelo es obligatorio")
    @Size(min = 2, max = 50, message = "El modelo debe tener entre 2 y 50 caracteres")
    private String model;

    @NotNull(message = "El precio de alquiler diario es obligatorio")
    @DecimalMin(value = "10000.00", message = "La tarifa diaria mínima permitida es de $10.000 COP")
    @DecimalMax(value = "50000000.00", message = "La tarifa diaria no puede exceder $50.000.000 COP")
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
