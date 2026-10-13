package com.opusrentals.modules.billing.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {

    private Long id;
    private Long invoiceId;
    private String invoiceNumber;
    private Long paymentMethodId;
    private String paymentMethodName;
    private String transactionReference;
    private BigDecimal amount;
    private LocalDateTime paymentDate;
    private String paymentStatus;
    private LocalDateTime createdAt;
}
