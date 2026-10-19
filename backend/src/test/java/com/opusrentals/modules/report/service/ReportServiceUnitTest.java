package com.opusrentals.modules.report.service;

import com.opusrentals.modules.billing.entity.Invoice;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalDamageRepository;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.report.dto.response.DashboardSummaryResponse;
import com.opusrentals.modules.report.dto.response.FleetStatusResponse;
import com.opusrentals.modules.report.dto.response.FrequentClientResponse;
import com.opusrentals.modules.tool.entity.Category;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ReportServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private ToolRepository toolRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private RentalDamageRepository damageRepository;

    @InjectMocks
    private ReportService reportService;

    private Client client;
    private Tool tool;
    private Category category;
    private Provider provider;
    private Rental rental;

    @BeforeEach
    void setUp() {
        User user = User.builder().id(1L).email("client@test.com").isActive(true).build();
        client = Client.builder()
                .id(1L)
                .user(user)
                .firstName("Carlos")
                .lastName("Mendoza")
                .documentNumber("10102020")
                .phone("3101234567")
                .build();

        provider = Provider.builder().id(1L).companyName("Equipos y Andamios S.A.S.").build();
        category = Category.builder().id(1L).name("Corte y Demolición").build();

        tool = Tool.builder()
                .id(10L)
                .provider(provider)
                .category(category)
                .name("Cortadora de Concreto CC-300")
                .status("AVAILABLE")
                .dailyPrice(new BigDecimal("120000.00"))
                .depositAmount(new BigDecimal("500000.00"))
                .build();

        rental = Rental.builder()
                .id(100L)
                .client(client)
                .tool(tool)
                .startDate(LocalDate.now().minusDays(5))
                .endDate(LocalDate.now().minusDays(2))
                .totalDays(3)
                .subtotal(new BigDecimal("360000.00"))
                .status("RETURNED")
                .build();
    }

    @Test
    @DisplayName("Should return frequent clients report correctly aggregated")
    void testGetFrequentClients() {
        when(clientRepository.findAll()).thenReturn(List.of(client));
        when(rentalRepository.findAll()).thenReturn(List.of(rental));

        List<FrequentClientResponse> result = reportService.getFrequentClients();

        assertNotNull(result);
        assertEquals(1, result.size());
        FrequentClientResponse fc = result.get(0);
        assertEquals(1L, fc.getClientId());
        assertEquals("Carlos Mendoza", fc.getFullName());
        assertEquals(1, fc.getTotalRentals());
        assertEquals(1, fc.getCompletedRentals());
        assertEquals(new BigDecimal("360000.00"), fc.getTotalSpent());
    }

    @Test
    @DisplayName("Should return fleet status breakdown correctly calculated")
    void testGetFleetStatusReport() {
        Tool rentedTool = Tool.builder()
                .id(11L)
                .provider(provider)
                .category(category)
                .name("Generador 5KVA")
                .status("RENTED")
                .build();

        when(toolRepository.findAll()).thenReturn(List.of(tool, rentedTool));

        FleetStatusResponse fleetStatus = reportService.getFleetStatusReport();

        assertNotNull(fleetStatus);
        assertEquals(2, fleetStatus.getTotalTools());
        assertEquals(1, fleetStatus.getAvailableCount());
        assertEquals(1, fleetStatus.getRentedCount());
        assertEquals(50.0, fleetStatus.getUtilizationRatePercentage());
        assertEquals(1, fleetStatus.getCategoryBreakdown().size());
        assertEquals("Corte y Demolición", fleetStatus.getCategoryBreakdown().get(0).getCategoryName());
    }
}
