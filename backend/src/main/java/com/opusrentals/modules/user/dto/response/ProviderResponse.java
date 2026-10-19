package com.opusrentals.modules.user.dto.response;

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
public class ProviderResponse {
    private Long id;
    private Long userId;
    private String email;
    private String companyName;
    private String taxId;
    private String address;
    private BigDecimal rating;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private List<UserProfileResponse.ContactResponse> contacts;
    private List<UserProfileResponse.CoverageResponse> coverageZones;
}
