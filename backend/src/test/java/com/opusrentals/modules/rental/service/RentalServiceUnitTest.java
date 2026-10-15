package com.opusrentals.modules.rental.service;

import com.opusrentals.modules.rental.dto.request.CreateRentalRequest;
import com.opusrentals.modules.rental.dto.response.RentalResponse;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.billing.service.InvoiceService;
import com.opusrentals.shared.exception.ConflictException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class RentalServiceUnitTest {

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private ToolRepository toolRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private InvoiceRepository invoiceRepository;

    @Mock
    private InvoiceService invoiceService;

    @InjectMocks
    private RentalService rentalService;

    private User user;
    private Client client;
    private Tool tool;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(1L)
                .email("cliente@test.com")
                .username("client_user")
                .build();

        client = Client.builder()
                .id(1L)
                .user(user)
                .firstName("Carlos")
                .lastName("Gomez")
                .phone("+57 300 123 4567")
                .build();

        Provider provider = Provider.builder()
                .id(1L)
                .companyName("Maquinaria del Norte")
                .build();

        tool = Tool.builder()
                .id(10L)
                .provider(provider)
                .name("Rompepavimentos TE 3000")
                .status("AVAILABLE")
                .dailyPrice(new BigDecimal("85000.00"))
                .depositAmount(new BigDecimal("400000.00"))
                .build();
    }

    @Test
    @DisplayName("Should successfully create a rental when dates are available")
    void testCreateRentalSuccess() {
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(3); // 3 days

        CreateRentalRequest request = CreateRentalRequest.builder()
                .toolId(10L)
                .startDate(start)
                .endDate(end)
                .notes("Alquiler para frente de obra")
                .build();

        when(userRepository.findByEmail("cliente@test.com")).thenReturn(Optional.of(user));
        when(clientRepository.findByUser(user)).thenReturn(Optional.of(client));
        when(toolRepository.findById(10L)).thenReturn(Optional.of(tool));
        when(rentalRepository.hasOverlappingRentals(10L, start, end)).thenReturn(false);

        Rental savedRental = Rental.builder()
                .id(100L)
                .client(client)
                .tool(tool)
                .startDate(start)
                .endDate(end)
                .totalDays(3)
                .dailyRate(new BigDecimal("85000.00"))
                .subtotal(new BigDecimal("255000.00"))
                .depositAmount(new BigDecimal("400000.00"))
                .status("PENDING")
                .build();

        when(rentalRepository.save(any(Rental.class))).thenReturn(savedRental);

        RentalResponse response = rentalService.createRental("cliente@test.com", request);

        assertNotNull(response);
        assertEquals(100L, response.getId());
        assertEquals(3, response.getTotalDays());
        assertEquals(new BigDecimal("255000.00"), response.getSubtotal());
        verify(rentalRepository, times(1)).save(any(Rental.class));
        verify(invoiceService, times(1)).createInvoiceForRental(savedRental);
    }

    @Test
    @DisplayName("Should throw ConflictException when tool has date overlap")
    void testCreateRentalDateCollision() {
        LocalDate start = LocalDate.now().plusDays(1);
        LocalDate end = LocalDate.now().plusDays(2);

        CreateRentalRequest request = CreateRentalRequest.builder()
                .toolId(10L)
                .startDate(start)
                .endDate(end)
                .build();

        when(userRepository.findByEmail("cliente@test.com")).thenReturn(Optional.of(user));
        when(clientRepository.findByUser(user)).thenReturn(Optional.of(client));
        when(toolRepository.findById(10L)).thenReturn(Optional.of(tool));
        when(rentalRepository.hasOverlappingRentals(10L, start, end)).thenReturn(true);

        assertThrows(ConflictException.class, () -> rentalService.createRental("cliente@test.com", request));
        verify(rentalRepository, never()).save(any(Rental.class));
    }
}
