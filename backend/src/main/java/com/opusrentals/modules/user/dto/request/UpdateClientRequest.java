package com.opusrentals.modules.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateClientRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(min = 2, max = 60, message = "El nombre debe tener entre 2 y 60 caracteres")
    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s'-]+$", message = "El nombre no puede contener números ni caracteres especiales")
    private String firstName;

    @Pattern(regexp = "^[a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\\s'-]*$", message = "El apellido no puede contener números ni caracteres especiales")
    private String lastName;

    private String documentType;

    @Pattern(regexp = "^[0-9a-zA-Z.-]*$", message = "El documento de identidad solo puede contener dígitos o guión")
    private String documentNumber;

    @Pattern(regexp = "^(\\+?[0-9]{1,3}[- ]?)?[0-9]{7,15}$|^$", message = "El teléfono debe contener entre 7 y 15 dígitos numéricos")
    private String phone;

    private String address;
}
