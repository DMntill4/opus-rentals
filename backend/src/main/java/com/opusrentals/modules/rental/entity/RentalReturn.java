package com.opusrentals.modules.rental.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "rental_returns")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RentalReturn {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "rental_id", nullable = false, unique = true)
    private Rental rental;

    @Column(name = "return_date", nullable = false)
    private LocalDate returnDate;

    @Builder.Default
    @Column(nullable = false, length = 30)
    private String status = "COMPLETED"; // COMPLETED, DAMAGED_REPORTED

    @Column(name = "general_notes", columnDefinition = "TEXT")
    private String generalNotes;

    @Column(name = "inspector_notes", columnDefinition = "TEXT")
    private String inspectorNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Builder.Default
    @OneToMany(mappedBy = "rentalReturn", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<RentalDamage> damages = new ArrayList<>();
}
