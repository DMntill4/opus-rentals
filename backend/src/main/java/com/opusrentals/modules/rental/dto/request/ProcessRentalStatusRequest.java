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
public class ProcessRentalStatusRequest {

    @NotBlank(message = "El nuevo estado es obligatorio")
    private String status; // APPROVED, IN_PROGRESS, CANCELLED

    private String reason;
}
