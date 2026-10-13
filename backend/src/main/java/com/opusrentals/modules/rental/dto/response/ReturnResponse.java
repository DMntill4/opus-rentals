package com.opusrentals.modules.rental.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnResponse {

    private Long id;
    private Long rentalId;
    private LocalDate returnDate;
    private String status;
    private String generalNotes;
    private String inspectorNotes;
    private LocalDateTime createdAt;
    private BigDecimal totalPenalties;
    private List<DamageResponse> damages;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DamageResponse {
        private Long id;
        private String description;
        private String severity;
        private BigDecimal penaltyAmount;
    }
}
