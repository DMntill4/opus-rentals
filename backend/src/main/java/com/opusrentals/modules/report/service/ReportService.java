package com.opusrentals.modules.report.service;

import com.opusrentals.modules.billing.entity.Invoice;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalDamageRepository;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.report.dto.response.DashboardSummaryResponse;
import com.opusrentals.modules.report.dto.response.MonthlyRevenueResponse;
import com.opusrentals.modules.report.dto.response.TopToolResponse;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;
    private final ToolRepository toolRepository;
    private final RentalRepository rentalRepository;
    private final InvoiceRepository invoiceRepository;
    private final RentalDamageRepository damageRepository;
    private final com.opusrentals.modules.rental.repository.RentalClaimRepository claimRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        long totalUsers = userRepository.count();
        long totalClients = clientRepository.count();
        long totalProviders = providerRepository.count();
        long totalTools = toolRepository.count();

        List<Rental> allRentals = rentalRepository.findAll();
        long totalRentals = allRentals.size();
        long activeRentals = allRentals.stream()
                .filter(r -> "IN_PROGRESS".equals(r.getStatus()) || "APPROVED".equals(r.getStatus()))
                .count();

        List<Invoice> allInvoices = invoiceRepository.findAll();
        BigDecimal totalRevenue = allInvoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal pendingRevenue = allInvoices.stream()
                .filter(i -> "ISSUED".equals(i.getStatus()))
                .map(Invoice::getTotalAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long reportedDamages = damageRepository.count();

        // Calculate revenue by month
        Map<String, List<Invoice>> byMonth = allInvoices.stream()
                .filter(i -> "PAID".equals(i.getStatus()))
                .collect(Collectors.groupingBy(i -> i.getIssueDate().format(DateTimeFormatter.ofPattern("yyyy-MM"))));

        List<MonthlyRevenueResponse> monthly = byMonth.entrySet().stream()
                .map(e -> {
                    BigDecimal sum = e.getValue().stream()
                            .map(Invoice::getTotalAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return new MonthlyRevenueResponse(e.getKey(), sum, e.getValue().size());
                })
                .sorted(Comparator.comparing(MonthlyRevenueResponse::getMonth))
                .collect(Collectors.toList());

        // Calculate top rented tools
        Map<Long, List<Rental>> byTool = allRentals.stream()
                .collect(Collectors.groupingBy(r -> r.getTool().getId()));

        List<TopToolResponse> topTools = byTool.entrySet().stream()
                .map(e -> {
                    Rental sample = e.getValue().get(0);
                    BigDecimal rev = e.getValue().stream()
                            .map(Rental::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return TopToolResponse.builder()
                            .toolId(e.getKey())
                            .toolName(sample.getTool().getName())
                            .categoryName(sample.getTool().getCategory().getName())
                            .providerCompanyName(sample.getTool().getProvider().getCompanyName())
                            .totalRentals(e.getValue().size())
                            .generatedRevenue(rev)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalRentals(), a.getTotalRentals()))
                .limit(10)
                .collect(Collectors.toList());

        return DashboardSummaryResponse.builder()
                .totalUsers(totalUsers)
                .totalClients(totalClients)
                .totalProviders(totalProviders)
                .totalTools(totalTools)
                .totalRentals(totalRentals)
                .activeRentals(activeRentals)
                .totalRevenue(totalRevenue)
                .pendingRevenue(pendingRevenue)
                .reportedDamages(reportedDamages)
                .revenueHistory(monthly)
                .topRentedTools(topTools)
                .build();
    }

    @Transactional(readOnly = true)
    public List<TopToolResponse> getTopTools() {
        List<Rental> allRentals = rentalRepository.findAll();
        Map<Long, List<Rental>> byTool = allRentals.stream()
                .collect(Collectors.groupingBy(r -> r.getTool().getId()));

        return byTool.entrySet().stream()
                .map(e -> {
                    Rental sample = e.getValue().get(0);
                    BigDecimal rev = e.getValue().stream()
                            .map(Rental::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    return TopToolResponse.builder()
                            .toolId(e.getKey())
                            .toolName(sample.getTool().getName())
                            .categoryName(sample.getTool().getCategory().getName())
                            .providerCompanyName(sample.getTool().getProvider().getCompanyName())
                            .totalRentals(e.getValue().size())
                            .generatedRevenue(rev)
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getTotalRentals(), a.getTotalRentals()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<com.opusrentals.modules.report.dto.response.FrequentClientResponse> getFrequentClients() {
        List<com.opusrentals.modules.user.entity.Client> allClients = clientRepository.findAll();
        List<Rental> allRentals = rentalRepository.findAll();

        Map<Long, List<Rental>> rentalsByClient = allRentals.stream()
                .collect(Collectors.groupingBy(r -> r.getClient().getId()));

        return allClients.stream()
                .map(client -> {
                    List<Rental> clientRentals = rentalsByClient.getOrDefault(client.getId(), Collections.emptyList());
                    long totalRentals = clientRentals.size();
                    long activeRentals = clientRentals.stream()
                            .filter(r -> "IN_PROGRESS".equals(r.getStatus()) || "APPROVED".equals(r.getStatus()))
                            .count();
                    long completedRentals = clientRentals.stream()
                            .filter(r -> "RETURNED".equals(r.getStatus()))
                            .count();
                    BigDecimal totalSpent = clientRentals.stream()
                            .filter(r -> !"CANCELLED".equals(r.getStatus()))
                            .map(Rental::getSubtotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    return com.opusrentals.modules.report.dto.response.FrequentClientResponse.builder()
                            .clientId(client.getId())
                            .userId(client.getUser().getId())
                            .fullName(client.getFirstName() + " " + client.getLastName())
                            .email(client.getUser().getEmail())
                            .phone(client.getPhone())
                            .documentNumber(client.getDocumentNumber())
                            .totalRentals(totalRentals)
                            .activeRentals(activeRentals)
                            .completedRentals(completedRentals)
                            .totalSpent(totalSpent)
                            .build();
                })
                .sorted(Comparator.comparingLong(com.opusrentals.modules.report.dto.response.FrequentClientResponse::getTotalRentals)
                        .reversed()
                        .thenComparing((a, b) -> b.getTotalSpent().compareTo(a.getTotalSpent())))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.opusrentals.modules.report.dto.response.FleetStatusResponse getFleetStatusReport() {
        List<com.opusrentals.modules.tool.entity.Tool> allTools = toolRepository.findAll();
        long totalTools = allTools.size();

        long availableCount = allTools.stream()
                .filter(t -> "AVAILABLE".equalsIgnoreCase(t.getStatus()))
                .count();
        long rentedCount = allTools.stream()
                .filter(t -> "RENTED".equalsIgnoreCase(t.getStatus()))
                .count();
        long maintenanceCount = allTools.stream()
                .filter(t -> "MAINTENANCE".equalsIgnoreCase(t.getStatus()))
                .count();
        long retiredCount = allTools.stream()
                .filter(t -> "RETIRED".equalsIgnoreCase(t.getStatus()))
                .count();

        double utilizationRate = totalTools > 0
                ? Math.round(((double) rentedCount / totalTools) * 10000.0) / 100.0
                : 0.0;

        Map<String, Long> statusBreakdown = allTools.stream()
                .collect(Collectors.groupingBy(t -> t.getStatus().toUpperCase(), Collectors.counting()));

        Map<Long, List<com.opusrentals.modules.tool.entity.Tool>> byCategory = allTools.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getId()));

        List<com.opusrentals.modules.report.dto.response.CategoryFleetMetricResponse> categoryBreakdown = byCategory.entrySet().stream()
                .map(entry -> {
                    List<com.opusrentals.modules.tool.entity.Tool> catTools = entry.getValue();
                    com.opusrentals.modules.tool.entity.Category cat = catTools.get(0).getCategory();
                    long catTotal = catTools.size();
                    long catAvail = catTools.stream().filter(t -> "AVAILABLE".equalsIgnoreCase(t.getStatus())).count();
                    long catRented = catTools.stream().filter(t -> "RENTED".equalsIgnoreCase(t.getStatus())).count();
                    long catMaint = catTools.stream().filter(t -> "MAINTENANCE".equalsIgnoreCase(t.getStatus())).count();
                    long catRetired = catTools.stream().filter(t -> "RETIRED".equalsIgnoreCase(t.getStatus())).count();

                    return com.opusrentals.modules.report.dto.response.CategoryFleetMetricResponse.builder()
                            .categoryId(cat.getId())
                            .categoryName(cat.getName())
                            .totalTools(catTotal)
                            .availableTools(catAvail)
                            .rentedTools(catRented)
                            .maintenanceTools(catMaint)
                            .retiredTools(catRetired)
                            .build();
                })
                .sorted(Comparator.comparing(com.opusrentals.modules.report.dto.response.CategoryFleetMetricResponse::getCategoryName))
                .collect(Collectors.toList());

        return com.opusrentals.modules.report.dto.response.FleetStatusResponse.builder()
                .totalTools(totalTools)
                .availableCount(availableCount)
                .rentedCount(rentedCount)
                .maintenanceCount(maintenanceCount)
                .retiredCount(retiredCount)
                .utilizationRatePercentage(utilizationRate)
                .statusBreakdown(statusBreakdown)
                .categoryBreakdown(categoryBreakdown)
                .build();
    }

    @Transactional(readOnly = true)
    public List<com.opusrentals.modules.report.dto.response.ProviderQualityResponse> getProviderQualityReports() {
        List<com.opusrentals.modules.user.entity.Provider> providers = providerRepository.findAll();
        List<Rental> allRentals = rentalRepository.findAll();
        List<com.opusrentals.modules.rental.entity.RentalClaim> allClaims = claimRepository.findAll();

        return providers.stream().map(provider -> {
            long totalRentals = allRentals.stream()
                    .filter(r -> r.getTool() != null && r.getTool().getProvider() != null && r.getTool().getProvider().getId().equals(provider.getId()))
                    .count();

            long returnedRentals = allRentals.stream()
                    .filter(r -> r.getTool() != null && r.getTool().getProvider() != null && r.getTool().getProvider().getId().equals(provider.getId()) && "RETURNED".equalsIgnoreCase(r.getStatus()))
                    .count();

            double returnRate = totalRentals > 0
                    ? Math.round(((double) returnedRentals / totalRentals) * 10000.0) / 100.0
                    : 0.0;

            long damageReports = allClaims.stream()
                    .filter(c -> c.getRental().getTool().getProvider().getId().equals(provider.getId()) && "DAMAGE_REPORT".equalsIgnoreCase(c.getClaimType()))
                    .count();

            long warrantyClaims = allClaims.stream()
                    .filter(c -> c.getRental().getTool().getProvider().getId().equals(provider.getId()) && "WARRANTY_REPLACEMENT".equalsIgnoreCase(c.getClaimType()))
                    .count();

            long refundRequests = allClaims.stream()
                    .filter(c -> c.getRental().getTool().getProvider().getId().equals(provider.getId()) && "REFUND_REQUEST".equalsIgnoreCase(c.getClaimType()))
                    .count();

            BigDecimal totalRefund = allClaims.stream()
                    .filter(c -> c.getRental().getTool().getProvider().getId().equals(provider.getId()) && ("APPROVED".equalsIgnoreCase(c.getStatus()) || "RESOLVED".equalsIgnoreCase(c.getStatus())))
                    .map(com.opusrentals.modules.rental.entity.RentalClaim::getRefundAmount)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            long activeTools = toolRepository.countByProviderId(provider.getId());

            return com.opusrentals.modules.report.dto.response.ProviderQualityResponse.builder()
                    .providerId(provider.getId())
                    .providerName(provider.getCompanyName())
                    .taxId(provider.getTaxId())
                    .city(provider.getAddress())
                    .totalRentals(totalRentals)
                    .returnedRentals(returnedRentals)
                    .returnRatePercentage(returnRate)
                    .damageReportsCount(damageReports)
                    .warrantyClaimsCount(warrantyClaims)
                    .refundRequestsCount(refundRequests)
                    .totalRefundAmount(totalRefund)
                    .activeToolsCount(activeTools)
                    .build();
        }).sorted(Comparator.comparing(com.opusrentals.modules.report.dto.response.ProviderQualityResponse::getTotalRentals).reversed())
          .collect(Collectors.toList());
    }
}
