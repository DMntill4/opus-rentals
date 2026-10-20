package com.opusrentals.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProviderRequest {

    @NotBlank(message = "La razón social o nombre de empresa es obligatorio")
    @Size(min = 3, max = 100, message = "La razón social debe tener entre 3 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\\s.,&'/()-]+$", message = "La razón social contiene caracteres especiales no válidos")
    private String companyName;

    @Pattern(regexp = "^(?i)(?:NIT\\s*[-:]?\\s*)?[0-9.\\-\\s]*$", message = "El NIT solo puede contener números, puntos, espacios o guión de verificación")
    private String taxId;

    private String address;

    private List<RegisterProviderRequest.ContactItem> contacts;
    private List<RegisterProviderRequest.CoverageItem> coverageZones;
}
