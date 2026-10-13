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
public class UserProfileResponse {

    private Long userId;
    private String email;
    private String role;
    private Boolean isActive;
    private LocalDateTime createdAt;

    // Client fields if applicable
    private Long clientId;
    private String firstName;
    private String lastName;
    private String documentType;
    private String documentNumber;
    private String phone;
    private String clientAddress;

    // Provider fields if applicable
    private Long providerId;
    private String companyName;
    private String taxId;
    private String providerAddress;
    private BigDecimal rating;
    private List<ContactResponse> contacts;
    private List<CoverageResponse> coverageZones;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ContactResponse {
        private Long id;
        private String contactType;
        private String contactValue;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CoverageResponse {
        private Long id;
        private String state;
        private String city;
    }
}
