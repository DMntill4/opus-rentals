package com.opusrentals.modules.rental.service;

import com.opusrentals.modules.billing.entity.Invoice;
import com.opusrentals.modules.billing.repository.InvoiceRepository;
import com.opusrentals.modules.billing.service.InvoiceService;
import com.opusrentals.modules.rental.dto.request.CreateRentalRequest;
import com.opusrentals.modules.rental.dto.request.ProcessRentalStatusRequest;
import com.opusrentals.modules.rental.dto.response.RentalResponse;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.User;
import com.opusrentals.modules.user.repository.ClientRepository;
import com.opusrentals.modules.user.repository.ProviderRepository;
import com.opusrentals.modules.user.repository.UserRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ConflictException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RentalService {

    private final RentalRepository rentalRepository;
    private final ToolRepository toolRepository;
    private final UserRepository userRepository;
    private final ClientRepository clientRepository;
    private final ProviderRepository providerRepository;
    private final InvoiceRepository invoiceRepository;
    private final InvoiceService invoiceService;

    @Transactional
    public RentalResponse createRental(String userEmail, CreateRentalRequest request) {
        if (request.getEndDate().isBefore(request.getStartDate())) {
            throw new BadRequestException("La fecha de finalización no puede ser anterior a la fecha de inicio");
        }

        long rentalDays = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (rentalDays > 30) {
            throw new BadRequestException("El período máximo de alquiler permitido por contrato es de 30 días (1 mes)");
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new BadRequestException("Solo clientes registrados pueden realizar alquileres"));

        Tool tool = toolRepository.findById(request.getToolId())
                .orElseThrow(() -> new ResourceNotFoundException("Herramienta no encontrada"));

        if (!"AVAILABLE".equals(tool.getStatus())) {
            throw new BadRequestException("La herramienta no está disponible actualmente para alquiler (Estado: " + tool.getStatus() + ")");
        }

        // Check date collisions taking into account units/quantity
        int requestedQty = (request.getQuantity() != null && request.getQuantity() > 0) ? request.getQuantity() : 1;
        int totalUnits = (tool.getTotalQuantity() != null && tool.getTotalQuantity() > 0) ? tool.getTotalQuantity() : 5;
        
        int rentedUnitsInPeriod = rentalRepository.sumRentedQuantityInPeriod(tool.getId(), request.getStartDate(), request.getEndDate());
        if (rentedUnitsInPeriod + requestedQty > totalUnits) {
            int availableUnits = Math.max(0, totalUnits - rentedUnitsInPeriod);
            throw new ConflictException("Solo hay " + availableUnits + " unidades disponibles para ese rango de fechas (solicitadas: " + requestedQty + ")");
        }

        int totalDays = (int) ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;
        if (totalDays <= 0) totalDays = 1;

        BigDecimal subtotal = tool.getDailyPrice().multiply(BigDecimal.valueOf(totalDays)).multiply(BigDecimal.valueOf(requestedQty));
        BigDecimal depositAmount = tool.getDepositAmount().multiply(BigDecimal.valueOf(requestedQty));

        Rental rental = Rental.builder()
                .client(client)
                .tool(tool)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .totalDays(totalDays)
                .quantity(requestedQty)
                .dailyRate(tool.getDailyPrice())
                .subtotal(subtotal)
                .depositAmount(depositAmount)
                .status("PENDING")
                .notes(request.getNotes())
                .build();

        Rental savedRental = rentalRepository.save(rental);

        // Auto-generate invoice upon reservation creation
        invoiceService.createInvoiceForRental(savedRental);

        return mapToResponse(savedRental);
    }

    @Transactional
    public RentalResponse updateRentalStatus(Long rentalId, String userEmail, ProcessRentalStatusRequest request) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Alquiler no encontrado con ID: " + rentalId));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        boolean isAdmin = "ROLE_ADMIN".equals(user.getRole().getName());
        boolean isProvider = (rental.getTool() != null && 
                             rental.getTool().getProvider() != null && 
                             rental.getTool().getProvider().getUser() != null && 
                             rental.getTool().getProvider().getUser().getId().equals(user.getId()))
                             || (rental.getTool() != null && rental.getTool().getProvider() != null &&
                                 providerRepository.findByUser(user).map(p -> p.getId().equals(rental.getTool().getProvider().getId())).orElse(false));
        boolean isClient = rental.getClient() != null && 
                           rental.getClient().getUser() != null && 
                           rental.getClient().getUser().getId().equals(user.getId());

        String targetStatus = request.getStatus() != null ? request.getStatus().trim().toUpperCase() : "CANCELLED";

        if (!isAdmin && !isProvider && !(isClient && "CANCELLED".equals(targetStatus))) {
            throw new BadRequestException("No tiene permisos para modificar el estado de este alquiler");
        }

        rental.setStatus(targetStatus);

        if ("APPROVED".equals(targetStatus) || "IN_PROGRESS".equals(targetStatus)) {
            invoiceService.createInvoiceForRental(rental);
            rental.getTool().setStatus("RENTED");
            toolRepository.save(rental.getTool());
        } else if ("CANCELLED".equals(targetStatus) || "RETURNED".equals(targetStatus)) {
            rental.getTool().setStatus("AVAILABLE");
            toolRepository.save(rental.getTool());
        }

        Rental updated = rentalRepository.save(rental);
        return mapToResponse(updated);
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalsByClient(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        Client client = clientRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de cliente no encontrado"));

        return rentalRepository.findByClientIdOrderByIdDesc(client.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalsByClientId(Long clientId) {
        return rentalRepository.findByClientIdOrderByIdDesc(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getRentalsByProvider(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));
        var provider = providerRepository.findByUser(user)
                .orElseThrow(() -> new ResourceNotFoundException("Perfil de proveedor no encontrado"));

        return rentalRepository.findByProviderId(provider.getId()).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<RentalResponse> getAllRentals() {
        return rentalRepository.findAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public RentalResponse getRentalById(Long id) {
        Rental rental = rentalRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alquiler no encontrado con ID: " + id));
        return mapToResponse(rental);
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, String>> getBookedDateRangesByToolId(Long toolId) {
        return rentalRepository.findActiveRentalsByToolId(toolId).stream()
                .map(r -> {
                    java.util.Map<String, String> map = new java.util.HashMap<>();
                    map.put("startDate", r.getStartDate().toString());
                    map.put("endDate", r.getEndDate().toString());
                    map.put("status", r.getStatus());
                    return map;
                })
                .collect(Collectors.toList());
    }

    public RentalResponse mapToResponse(Rental rental) {
        Tool tool = rental.getTool();
        String coverImage = null;
        if (tool.getImages() != null && !tool.getImages().isEmpty()) {
            coverImage = tool.getImages().get(0).getImageUrl();
        }

        BigDecimal tax = rental.getSubtotal().multiply(new BigDecimal("0.19")).setScale(2, RoundingMode.HALF_UP);
        BigDecimal totalWithTax = rental.getSubtotal().add(tax);
        BigDecimal estimatedTotal = totalWithTax;

        Long invoiceId = null;
        String invoiceNumber = null;
        String invoiceStatus = null;

        Optional<Invoice> invOpt = invoiceRepository.findByRentalId(rental.getId());
        if (invOpt.isPresent()) {
            Invoice inv = invOpt.get();
            invoiceId = inv.getId();
            invoiceNumber = inv.getInvoiceNumber();
            invoiceStatus = inv.getStatus();
        }

        return RentalResponse.builder()
                .id(rental.getId())
                .clientId(rental.getClient().getId())
                .clientFullName(rental.getClient().getFirstName() + " " + rental.getClient().getLastName())
                .clientPhone(rental.getClient().getPhone())
                .toolId(tool.getId())
                .toolName(tool.getName())
                .toolBrand(tool.getBrand())
                .toolModel(tool.getModel())
                .toolCoverImageUrl(coverImage)
                .providerId(tool.getProvider().getId())
                .providerCompanyName(tool.getProvider().getCompanyName())
                .startDate(rental.getStartDate())
                .endDate(rental.getEndDate())
                .totalDays(rental.getTotalDays())
                .quantity(rental.getQuantity() != null ? rental.getQuantity() : 1)
                .dailyRate(rental.getDailyRate())
                .subtotal(rental.getSubtotal())
                .depositAmount(rental.getDepositAmount())
                .estimatedTotal(estimatedTotal)
                .totalAmount(totalWithTax)
                .status(rental.getStatus())
                .notes(rental.getNotes())
                .createdAt(rental.getCreatedAt())
                .invoiceId(invoiceId)
                .invoiceNumber(invoiceNumber)
                .invoiceStatus(invoiceStatus)
                .build();
    }
}
