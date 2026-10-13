package com.opusrentals.modules.rental.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessReturnRequest {

    @NotNull(message = "La fecha de devolución es obligatoria")
    private LocalDate returnDate;

    private String generalNotes;
    private String inspectorNotes;

    private List<DamageItem> damages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamageItem {
        private String description;
        private String severity; // MINOR, MODERATE, SEVERE, TOTAL_LOSS
        private BigDecimal penaltyAmount;
    }
}
