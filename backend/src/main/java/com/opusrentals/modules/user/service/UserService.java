package com.opusrentals.modules.user.service;

import com.opusrentals.modules.user.dto.response.UserProfileResponse;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;

    @Transactional(readOnly = true)
    public List<UserProfileResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::mapToProfileResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        return mapToProfileResponse(user);
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + email));
        return mapToProfileResponse(user);
    }

    @Transactional
    public UserProfileResponse toggleUserStatus(Long id, Boolean active) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con ID: " + id));
        user.setIsActive(active);
        User saved = userRepository.save(user);
        return mapToProfileResponse(saved);
    }

    private final com.opusrentals.modules.rental.repository.RentalRepository rentalRepository;
    private final com.opusrentals.modules.tool.repository.ToolRepository toolRepository;

    @Transactional(readOnly = true)
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<com.opusrentals.modules.user.dto.response.ClientResponse> getAllClientResponses() {
        return clientRepository.findAll().stream()
                .map(this::mapToClientResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.opusrentals.modules.user.dto.response.ClientResponse getClientResponseById(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + id));
        return mapToClientResponse(client);
    }

    @Transactional
    public com.opusrentals.modules.user.dto.response.ClientResponse updateClient(Long id, String currentUserEmail, com.opusrentals.modules.user.dto.request.UpdateClientRequest request) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario actual no autenticado"));

        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole().getName());
        boolean isOwner = client.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new com.opusrentals.shared.exception.BadRequestException("No tiene permisos para modificar este perfil de cliente");
        }

        if (request.getFirstName() != null && !request.getFirstName().isBlank()) {
            client.setFirstName(request.getFirstName().trim());
        }
        if (request.getLastName() != null) {
            client.setLastName(request.getLastName().trim());
        }
        if (request.getDocumentType() != null && !request.getDocumentType().isBlank()) {
            client.setDocumentType(request.getDocumentType().trim());
        }
        if (request.getDocumentNumber() != null && !request.getDocumentNumber().isBlank()) {
            client.setDocumentNumber(request.getDocumentNumber().trim());
        }
        if (request.getPhone() != null) {
            client.setPhone(request.getPhone().trim());
        }
        if (request.getAddress() != null) {
            client.setAddress(request.getAddress().trim());
        }

        Client saved = clientRepository.save(client);
        return mapToClientResponse(saved);
    }

    @Transactional
    public void deleteClient(Long id) {
        Client client = clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado con ID: " + id));

        var clientRentals = rentalRepository.findByClientIdOrderByIdDesc(id);
        if (clientRentals != null && !clientRentals.isEmpty()) {
            // Soft delete user to preserve transactional integrity with rentals/invoices
            User user = client.getUser();
            user.setIsActive(false);
            userRepository.save(user);
        } else {
            User user = client.getUser();
            clientRepository.delete(client);
            userRepository.delete(user);
        }
    }

    @Transactional(readOnly = true)
    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<com.opusrentals.modules.user.dto.response.ProviderResponse> getAllProviderResponses() {
        return providerRepository.findAll().stream()
                .map(this::mapToProviderResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public com.opusrentals.modules.user.dto.response.ProviderResponse getProviderResponseById(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));
        return mapToProviderResponse(provider);
    }

    @Transactional
    public com.opusrentals.modules.user.dto.response.ProviderResponse updateProvider(Long id, String currentUserEmail, com.opusrentals.modules.user.dto.request.UpdateProviderRequest request) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));

        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario actual no autenticado"));

        boolean isAdmin = "ROLE_ADMIN".equals(currentUser.getRole().getName());
        boolean isOwner = provider.getUser().getId().equals(currentUser.getId());

        if (!isAdmin && !isOwner) {
            throw new com.opusrentals.shared.exception.BadRequestException("No tiene permisos para modificar este perfil de proveedor");
        }

        if (request.getCompanyName() != null && !request.getCompanyName().isBlank()) {
            provider.setCompanyName(request.getCompanyName().trim());
        }
        if (request.getTaxId() != null && !request.getTaxId().isBlank()) {
            provider.setTaxId(request.getTaxId().trim());
        }
        if (request.getAddress() != null) {
            provider.setAddress(request.getAddress().trim());
        }

        if (request.getContacts() != null) {
            provider.getContacts().clear();
            for (var c : request.getContacts()) {
                if (c.getContactValue() != null && !c.getContactValue().isBlank()) {
                    provider.getContacts().add(com.opusrentals.modules.user.entity.ProviderContact.builder()
                            .provider(provider)
                            .contactType(c.getContactType() != null ? c.getContactType() : "PHONE")
                            .contactValue(c.getContactValue().trim())
                            .build());
                }
            }
        }

        if (request.getCoverageZones() != null) {
            provider.getCoverageZones().clear();
            for (var z : request.getCoverageZones()) {
                if (z.getState() != null && !z.getState().isBlank() && z.getCity() != null && !z.getCity().isBlank()) {
                    provider.getCoverageZones().add(com.opusrentals.modules.user.entity.ProviderCoverage.builder()
                            .provider(provider)
                            .state(z.getState().trim())
                            .city(z.getCity().trim())
                            .build());
                }
            }
        }

        Provider saved = providerRepository.save(provider);
        return mapToProviderResponse(saved);
    }

    @Transactional
    public void deleteProvider(Long id) {
        Provider provider = providerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Proveedor no encontrado con ID: " + id));

        var providerTools = toolRepository.findByProviderId(id);
        if (providerTools != null && !providerTools.isEmpty()) {
            // Soft delete user to preserve machinery catalog & history
            User user = provider.getUser();
            user.setIsActive(false);
            userRepository.save(user);
        } else {
            User user = provider.getUser();
            providerRepository.delete(provider);
            userRepository.delete(user);
        }
    }

    private com.opusrentals.modules.user.dto.response.ClientResponse mapToClientResponse(Client client) {
        return com.opusrentals.modules.user.dto.response.ClientResponse.builder()
                .id(client.getId())
                .userId(client.getUser().getId())
                .email(client.getUser().getEmail())
                .firstName(client.getFirstName())
                .lastName(client.getLastName())
                .documentType(client.getDocumentType())
                .documentNumber(client.getDocumentNumber())
                .phone(client.getPhone())
                .address(client.getAddress())
                .isActive(client.getUser().getIsActive())
                .createdAt(client.getCreatedAt())
                .build();
    }

    private com.opusrentals.modules.user.dto.response.ProviderResponse mapToProviderResponse(Provider provider) {
        return com.opusrentals.modules.user.dto.response.ProviderResponse.builder()
                .id(provider.getId())
                .userId(provider.getUser().getId())
                .email(provider.getUser().getEmail())
                .companyName(provider.getCompanyName())
                .taxId(provider.getTaxId())
                .address(provider.getAddress())
                .rating(provider.getRating())
                .isActive(provider.getUser().getIsActive())
                .createdAt(provider.getCreatedAt())
                .contacts(provider.getContacts() != null ? provider.getContacts().stream()
                        .map(c -> new UserProfileResponse.ContactResponse(c.getId(), c.getContactType(), c.getContactValue()))
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .coverageZones(provider.getCoverageZones() != null ? provider.getCoverageZones().stream()
                        .map(z -> new UserProfileResponse.CoverageResponse(z.getId(), z.getState(), z.getCity()))
                        .collect(Collectors.toList()) : java.util.Collections.emptyList())
                .build();
    }

    private UserProfileResponse mapToProfileResponse(User user) {
        UserProfileResponse.UserProfileResponseBuilder builder = UserProfileResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt());

        if ("ROLE_CLIENT".equals(user.getRole().getName())) {
            Optional<Client> clientOpt = clientRepository.findByUser(user);
            clientOpt.ifPresent(c -> builder
                    .clientId(c.getId())
                    .firstName(c.getFirstName())
                    .lastName(c.getLastName())
                    .documentType(c.getDocumentType())
                    .documentNumber(c.getDocumentNumber())
                    .phone(c.getPhone())
                    .clientAddress(c.getAddress()));
        } else if ("ROLE_PROVIDER".equals(user.getRole().getName())) {
            Optional<Provider> providerOpt = providerRepository.findByUser(user);
            providerOpt.ifPresent(p -> {
                builder.providerId(p.getId())
                        .companyName(p.getCompanyName())
                        .taxId(p.getTaxId())
                        .providerAddress(p.getAddress())
                        .rating(p.getRating());

                if (p.getContacts() != null) {
                    builder.contacts(p.getContacts().stream()
                            .map(c -> new UserProfileResponse.ContactResponse(c.getId(), c.getContactType(), c.getContactValue()))
                            .collect(Collectors.toList()));
                }
                if (p.getCoverageZones() != null) {
                    builder.coverageZones(p.getCoverageZones().stream()
                            .map(z -> new UserProfileResponse.CoverageResponse(z.getId(), z.getState(), z.getCity()))
                            .collect(Collectors.toList()));
                }
            });
        }

        return builder.build();
    }
}
