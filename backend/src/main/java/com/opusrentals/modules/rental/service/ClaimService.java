package com.opusrentals.modules.rental.service;

import com.opusrentals.modules.rental.dto.request.CreateClaimRequest;
import com.opusrentals.modules.rental.dto.request.ResolveClaimRequest;
import com.opusrentals.modules.rental.dto.response.ClaimResponse;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.entity.RentalClaim;
import com.opusrentals.modules.rental.repository.RentalClaimRepository;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ClaimService {

    private final RentalClaimRepository claimRepository;
    private final RentalRepository rentalRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;

    @Transactional
    public ClaimResponse createClaim(Long rentalId, String userEmail, CreateClaimRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Solo clientes registrados pueden radicar reclamaciones"));

        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Alquiler no encontrado con ID: " + rentalId));

        if (!rental.getClient().getId().equals(client.getId())) {
            throw new BadRequestException("No tiene permisos para radicar novedades sobre un alquiler que no le pertenece");
        }

        String claimType = request.getClaimType() != null ? request.getClaimType().trim().toUpperCase() : "WARRANTY_REPLACEMENT";
        if (!List.of("WARRANTY_REPLACEMENT", "DAMAGE_REPORT", "REFUND_REQUEST").contains(claimType)) {
            claimType = "WARRANTY_REPLACEMENT";
        }

        RentalClaim claim = RentalClaim.builder()
                .rental(rental)
                .client(client)
                .claimType(claimType)
                .reason(request.getReason())
                .description(request.getDescription())
                .requestedAction(request.getRequestedAction() != null ? request.getRequestedAction() : "REPLACEMENT")
                .status("PENDING")
                .refundAmount(BigDecimal.ZERO)
                .build();

        RentalClaim saved = claimRepository.save(claim);
        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getClaimsByRental(Long rentalId, String userEmail) {
        return claimRepository.findByRentalIdOrderByIdDesc(rentalId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getMyClaims(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Cliente no encontrado"));

        return claimRepository.findByClientIdOrderByIdDesc(client.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getProviderClaims(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Provider provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Proveedor no encontrado"));

        return claimRepository.findByProviderId(provider.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ClaimResponse> getAllClaims() {
        return claimRepository.findAllByOrderByIdDesc().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public ClaimResponse resolveClaim(Long claimId, String userEmail, ResolveClaimRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        RentalClaim claim = claimRepository.findById(claimId)
                .orElseThrow(() -> new ResourceNotFoundException("Reclamación no encontrada con ID: " + claimId));

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole().getName());
        boolean isProvider = claim.getRental().getTool().getProvider().getUser().getId().equals(user.getId());

        if (!isAdmin && !isProvider) {
            throw new BadRequestException("Solo el proveedor del equipo o el administrador pueden resolver reclamaciones");
        }

        String targetStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "RESOLVED";
        claim.setStatus(targetStatus);
        if (request.getRefundAmount() != null) {
            claim.setRefundAmount(request.getRefundAmount());
        }
        if (request.getResolutionNotes() != null) {
            claim.setResolutionNotes(request.getResolutionNotes());
        }
        claim.setResolvedAt(LocalDateTime.now());

        RentalClaim updated = claimRepository.save(claim);
        return mapToResponse(updated);
    }

    public ClaimResponse mapToResponse(RentalClaim claim) {
        Rental rental = claim.getRental();
        Client client = claim.getClient();
        var tool = rental.getTool();
        var provider = tool.getProvider();

        return ClaimResponse.builder()
                .id(claim.getId())
                .rentalId(rental.getId())
                .clientId(client.getId())
                .clientFullName(client.getFirstName() + " " + client.getLastName())
                .clientPhone(client.getPhone())
                .toolId(tool.getId())
                .toolName(tool.getName())
                .providerId(provider.getId())
                .providerCompanyName(provider.getCompanyName())
                .claimType(claim.getClaimType())
                .reason(claim.getReason())
                .description(claim.getDescription())
                .requestedAction(claim.getRequestedAction())
                .status(claim.getStatus())
                .refundAmount(claim.getRefundAmount())
                .resolutionNotes(claim.getResolutionNotes())
                .createdAt(claim.getCreatedAt())
                .resolvedAt(claim.getResolvedAt())
                .build();
    }
}
