package com.opusrentals.modules.user.dto.request;

import jakarta.validation.constraints.Email;
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
public class RegisterProviderRequest {

    @NotBlank(message = "El email es obligatorio")
    @Email(message = "El formato de correo electrónico corporativo es inválido")
    @Pattern(regexp = "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$", 
             message = "El correo debe tener un formato corporativo válido con @ y dominio (ej. contacto@empresa.com)")
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "La razón social o nombre de empresa es obligatorio")
    @Size(min = 3, max = 100, message = "La razón social debe tener entre 3 y 100 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ0-9\\s.,&'/()-]+$", message = "La razón social contiene caracteres especiales no válidos")
    private String companyName;

    @Pattern(regexp = "^(?i)(?:NIT\\s*[-:]?\\s*)?[0-9.-]*$", message = "El NIT solo puede contener números, puntos o guión de verificación")
    private String taxId;

    private String address;

    private List<ContactItem> contacts;
    private List<CoverageItem> coverageZones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactItem {
        private String contactType;
        private String contactValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageItem {
        private String state;
        private String city;
    }
}
