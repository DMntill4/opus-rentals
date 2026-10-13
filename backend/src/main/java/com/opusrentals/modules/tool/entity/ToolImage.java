package com.opusrentals.modules.tool.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tool_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ToolImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "tool_id", nullable = false)
    private Tool tool;

    @Column(name = "image_url", nullable = false, length = 500)
    private String imageUrl;

    @Builder.Default
    @Column(name = "is_cover", nullable = false)
    private Boolean isCover = false;
}
