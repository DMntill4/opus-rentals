package com.opusrentals.modules.billing.dto.request;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProcessPaymentRequest {

    @NotNull(message = "El ID de la factura es obligatorio")
    private Long invoiceId;

    @NotNull(message = "El método de pago es obligatorio")
    private Long paymentMethodId;

    @NotNull(message = "El monto a pagar es obligatorio")
    @DecimalMin(value = "0.01", message = "El monto debe ser superior a cero")
    private BigDecimal amount;
}
