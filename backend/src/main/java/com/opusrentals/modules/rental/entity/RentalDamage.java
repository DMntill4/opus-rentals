package com.opusrentals.modules.rental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "rental_damages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalDamage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "return_id", nullable = false)
    private RentalReturn rentalReturn;

    @Column(nullable = false, length = 255)
    private String description;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String severity = "MINOR"; // MINOR, MODERATE, SEVERE, TOTAL_LOSS

    @Builder.Default
    @Column(name = "penalty_amount", nullable = false, precision = 12, scale = 2)
    private BigDecimal penaltyAmount = BigDecimal.ZERO;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
