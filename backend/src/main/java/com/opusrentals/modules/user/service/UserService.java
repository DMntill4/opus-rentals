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

    @Transactional(readOnly = true)
    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Provider> getAllProviders() {
        return providerRepository.findAll();
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
