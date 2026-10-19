package com.opusrentals.modules.user.service;

import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.dto.request.UpdateClientRequest;
import com.opusrentals.modules.user.dto.request.UpdateProviderRequest;
import com.opusrentals.modules.user.dto.response.ClientResponse;
import com.opusrentals.modules.user.dto.response.ProviderResponse;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.Role;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceUnitTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ClientRepository clientRepository;

    @Mock
    private ProviderRepository providerRepository;

    @Mock
    private RentalRepository rentalRepository;

    @Mock
    private ToolRepository toolRepository;

    @InjectMocks
    private UserService userService;

    private User clientUser;
    private Client client;
    private User providerUser;
    private Provider provider;
    private Role clientRole;
    private Role providerRole;
    private Role adminRole;

    @BeforeEach
    void setUp() {
        clientRole = Role.builder().id(2L).name("ROLE_CLIENT").build();
        providerRole = Role.builder().id(3L).name("ROLE_PROVIDER").build();
        adminRole = Role.builder().id(1L).name("ROLE_ADMIN").build();

        clientUser = User.builder()
                .id(10L)
                .email("client@test.com")
                .role(clientRole)
                .isActive(true)
                .build();

        client = Client.builder()
                .id(1L)
                .user(clientUser)
                .firstName("Juan")
                .lastName("Perez")
                .documentType("CC")
                .documentNumber("123456789")
                .phone("3001234567")
                .address("Calle 100 #10-20")
                .build();

        providerUser = User.builder()
                .id(20L)
                .email("provider@test.com")
                .role(providerRole)
                .isActive(true)
                .build();

        provider = Provider.builder()
                .id(2L)
                .user(providerUser)
                .companyName("Maquinaria Express S.A.S.")
                .taxId("900123456-7")
                .address("Zona Industrial Cra 50")
                .rating(new BigDecimal("4.8"))
                .contacts(new ArrayList<>())
                .coverageZones(new ArrayList<>())
                .build();
    }

    @Test
    @DisplayName("Should return all client responses")
    void testGetAllClientResponses() {
        when(clientRepository.findAll()).thenReturn(List.of(client));

        List<ClientResponse> result = userService.getAllClientResponses();

        assertEquals(1, result.size());
        assertEquals("Juan", result.get(0).getFirstName());
        assertEquals("client@test.com", result.get(0).getEmail());
    }

    @Test
    @DisplayName("Should return client response by id")
    void testGetClientResponseByIdSuccess() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));

        ClientResponse result = userService.getClientResponseById(1L);

        assertNotNull(result);
        assertEquals(1L, result.getId());
        assertEquals("Juan", result.getFirstName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when client not found")
    void testGetClientResponseByIdNotFound() {
        when(clientRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> userService.getClientResponseById(99L));
    }

    @Test
    @DisplayName("Should successfully update client when authorized as owner")
    void testUpdateClientAsOwner() {
        UpdateClientRequest request = UpdateClientRequest.builder()
                .firstName("Juan Carlos")
                .phone("3119876543")
                .address("Nueva Direccion 45")
                .build();

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.findByEmail("client@test.com")).thenReturn(Optional.of(clientUser));
        when(clientRepository.save(any(Client.class))).thenAnswer(inv -> inv.getArgument(0));

        ClientResponse result = userService.updateClient(1L, "client@test.com", request);

        assertNotNull(result);
        assertEquals("Juan Carlos", result.getFirstName());
        assertEquals("3119876543", result.getPhone());
        assertEquals("Nueva Direccion 45", result.getAddress());
        verify(clientRepository, times(1)).save(client);
    }

    @Test
    @DisplayName("Should throw BadRequestException when unauthorized user updates client")
    void testUpdateClientUnauthorized() {
        User anotherUser = User.builder().id(999L).email("hacker@test.com").role(clientRole).build();
        UpdateClientRequest request = UpdateClientRequest.builder().firstName("Hacked").build();

        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(userRepository.findByEmail("hacker@test.com")).thenReturn(Optional.of(anotherUser));

        assertThrows(BadRequestException.class, () -> userService.updateClient(1L, "hacker@test.com", request));
        verify(clientRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should soft-delete client by setting user isActive=false when rentals exist")
    void testDeleteClientWithRentalsSoftDeletes() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(rentalRepository.findByClientIdOrderByIdDesc(1L)).thenReturn(List.of(Rental.builder().id(50L).build()));

        userService.deleteClient(1L);

        assertFalse(clientUser.getIsActive());
        verify(userRepository, times(1)).save(clientUser);
        verify(clientRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should physically delete client and user when no rentals exist")
    void testDeleteClientWithoutRentalsHardDeletes() {
        when(clientRepository.findById(1L)).thenReturn(Optional.of(client));
        when(rentalRepository.findByClientIdOrderByIdDesc(1L)).thenReturn(Collections.emptyList());

        userService.deleteClient(1L);

        verify(clientRepository, times(1)).delete(client);
        verify(userRepository, times(1)).delete(clientUser);
    }

    @Test
    @DisplayName("Should return all provider responses")
    void testGetAllProviderResponses() {
        when(providerRepository.findAll()).thenReturn(List.of(provider));

        List<ProviderResponse> result = userService.getAllProviderResponses();

        assertEquals(1, result.size());
        assertEquals("Maquinaria Express S.A.S.", result.get(0).getCompanyName());
    }

    @Test
    @DisplayName("Should successfully update provider when authorized as owner")
    void testUpdateProviderAsOwner() {
        UpdateProviderRequest request = UpdateProviderRequest.builder()
                .companyName("Maquinaria Express Renovada")
                .address("Nueva Zona Industrial")
                .build();

        when(providerRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(userRepository.findByEmail("provider@test.com")).thenReturn(Optional.of(providerUser));
        when(providerRepository.save(any(Provider.class))).thenAnswer(inv -> inv.getArgument(0));

        ProviderResponse result = userService.updateProvider(2L, "provider@test.com", request);

        assertNotNull(result);
        assertEquals("Maquinaria Express Renovada", result.getCompanyName());
        assertEquals("Nueva Zona Industrial", result.getAddress());
        verify(providerRepository, times(1)).save(provider);
    }

    @Test
    @DisplayName("Should soft-delete provider by setting user isActive=false when tools exist")
    void testDeleteProviderWithToolsSoftDeletes() {
        when(providerRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(toolRepository.findByProviderId(2L)).thenReturn(List.of(Tool.builder().id(100L).build()));

        userService.deleteProvider(2L);

        assertFalse(providerUser.getIsActive());
        verify(userRepository, times(1)).save(providerUser);
        verify(providerRepository, never()).delete(any());
    }

    @Test
    @DisplayName("Should physically delete provider and user when no tools exist")
    void testDeleteProviderWithoutToolsHardDeletes() {
        when(providerRepository.findById(2L)).thenReturn(Optional.of(provider));
        when(toolRepository.findByProviderId(2L)).thenReturn(Collections.emptyList());

        userService.deleteProvider(2L);

        verify(providerRepository, times(1)).delete(provider);
        verify(userRepository, times(1)).delete(providerUser);
    }
}
