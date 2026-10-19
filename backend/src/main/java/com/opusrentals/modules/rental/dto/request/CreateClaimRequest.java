package com.opusrentals.modules.rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateClaimRequest {

    @NotBlank(message = "El tipo de reclamación es obligatorio (WARRANTY_REPLACEMENT, DAMAGE_REPORT, REFUND_REQUEST)")
    private String claimType;

    @NotBlank(message = "El motivo de la solicitud es obligatorio")
    private String reason;

    @NotBlank(message = "La descripción detallada de la novedad es obligatoria")
    private String description;

    private String requestedAction; // REPLACEMENT, TECHNICIAN_VISIT, PARTIAL_REFUND, TOTAL_REFUND
}
