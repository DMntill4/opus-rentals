package com.opusrentals.modules.rental.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResolveClaimRequest {

    @NotBlank(message = "El nuevo estado es obligatorio (APPROVED, REJECTED, RESOLVED)")
    private String status;

    private BigDecimal refundAmount;

    private String resolutionNotes;
}
