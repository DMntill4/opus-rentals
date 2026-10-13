package com.opusrentals.modules.user.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "provider_contacts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProviderContact {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "provider_id", nullable = false)
    private Provider provider;

    @Column(name = "contact_type", nullable = false, length = 30)
    private String contactType;

    @Column(name = "contact_value", nullable = false, length = 150)
    private String contactValue;
}
