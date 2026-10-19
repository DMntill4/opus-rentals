package com.opusrentals.modules.rental.entity;

import com.opusrentals.modules.user.entity.Client;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_claims")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalClaim {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_id", nullable = false)
    private Rental rental;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "client_id", nullable = false)
    private Client client;

    @Column(name = "claim_type", nullable = false, length = 50)
    private String claimType; // WARRANTY_REPLACEMENT, DAMAGE_REPORT, REFUND_REQUEST

    @Column(nullable = false, length = 255)
    private String reason;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "requested_action", length = 100)
    private String requestedAction; // REPLACEMENT, TECHNICIAN_VISIT, PARTIAL_REFUND, TOTAL_REFUND

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "PENDING"; // PENDING, IN_REVIEW, APPROVED, REJECTED, RESOLVED

    @Builder.Default
    @Column(name = "refund_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal refundAmount = BigDecimal.ZERO;

    @Column(name = "resolution_notes", columnDefinition = "TEXT")
    private String resolutionNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "resolved_at")
    private LocalDateTime resolvedAt;
}
