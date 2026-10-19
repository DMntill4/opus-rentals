package com.opusrentals.modules.tool.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ToolResponse {

    private Long id;
    private Long providerId;
    private String providerCompanyName;
    private Long categoryId;
    private String categoryName;
    private String name;
    private String brand;
    private String model;
    private BigDecimal dailyPrice;
    private BigDecimal depositAmount;
    private Integer totalQuantity;
    private Integer availableQuantity;
    private String status;
    private LocalDateTime createdAt;
    private String coverImageUrl;
    private List<ImageResponse> images;
    private List<SpecificationResponse> specifications;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ImageResponse {
        private Long id;
        private String imageUrl;
        private Boolean isCover;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SpecificationResponse {
        private Long id;
        private String specKey;
        private String specValue;
    }
}
