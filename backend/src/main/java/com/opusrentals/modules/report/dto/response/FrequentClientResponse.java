package com.opusrentals.modules.report.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FrequentClientResponse {
    private Long clientId;
    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private String documentNumber;
    private long totalRentals;
    private long activeRentals;
    private long completedRentals;
    private BigDecimal totalSpent;
}
