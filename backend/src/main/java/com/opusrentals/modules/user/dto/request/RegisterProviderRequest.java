package com.opusrentals.modules.user.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
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
    private String email;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 6, message = "La contraseña debe tener al menos 6 caracteres")
    private String password;

    @NotBlank(message = "La razón social o nombre de empresa es obligatorio")
    private String companyName;

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
