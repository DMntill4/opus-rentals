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
}
