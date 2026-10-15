package com.opusrentals.modules.rental.service;

import com.opusrentals.modules.rental.dto.request.ProcessReturnRequest;
import com.opusrentals.modules.rental.dto.response.ReturnResponse;
import com.opusrentals.modules.rental.entity.Rental;
import com.opusrentals.modules.rental.entity.RentalDamage;
import com.opusrentals.modules.rental.entity.RentalReturn;
import com.opusrentals.modules.rental.repository.RentalRepository;
import com.opusrentals.modules.rental.repository.RentalReturnRepository;
import com.opusrentals.modules.tool.entity.Tool;
import com.opusrentals.modules.tool.repository.ToolRepository;
import com.opusrentals.shared.exception.BadRequestException;
import com.opusrentals.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReturnService {

    private final RentalReturnRepository returnRepository;
    private final RentalRepository rentalRepository;
    private final ToolRepository toolRepository;

    @Transactional
    public ReturnResponse processReturn(Long rentalId, ProcessReturnRequest request) {
        Rental rental = rentalRepository.findById(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("Alquiler no encontrado con ID: " + rentalId));

        if ("RETURNED".equals(rental.getStatus())) {
            throw new BadRequestException("Este alquiler ya ha sido finalizado y devuelto");
        }

        boolean hasDamages = request.getDamages() != null && !request.getDamages().isEmpty();
        String returnStatus = hasDamages ? "DAMAGED_REPORTED" : "COMPLETED";

        RentalReturn rentalReturn = RentalReturn.builder()
                .rental(rental)
                .returnDate(request.getReturnDate())
                .status(returnStatus)
                .generalNotes(request.getGeneralNotes())
                .inspectorNotes(request.getInspectorNotes())
                .damages(new ArrayList<>())
                .build();

        if (hasDamages) {
            for (var d : request.getDamages()) {
                rentalReturn.getDamages().add(RentalDamage.builder()
                        .rentalReturn(rentalReturn)
                        .description(d.getDescription())
                        .severity(d.getSeverity() != null ? d.getSeverity() : "MINOR")
                        .penaltyAmount(d.getPenaltyAmount() != null ? d.getPenaltyAmount() : BigDecimal.ZERO)
                        .build());
            }
        }

        RentalReturn savedReturn = returnRepository.save(rentalReturn);

        // Update rental status
        rental.setStatus("RETURNED");
        rentalRepository.save(rental);

        // Update tool status (if severe damages, put into MAINTENANCE, else back to AVAILABLE)
        Tool tool = rental.getTool();
        boolean hasSevereDamage = hasDamages && request.getDamages().stream()
                .anyMatch(d -> "SEVERE".equalsIgnoreCase(d.getSeverity()) || "TOTAL_LOSS".equalsIgnoreCase(d.getSeverity()));

        tool.setStatus(hasSevereDamage ? "MAINTENANCE" : "AVAILABLE");
        toolRepository.save(tool);

        return mapToResponse(savedReturn);
    }

    @Transactional(readOnly = true)
    public ReturnResponse getReturnByRentalId(Long rentalId) {
        RentalReturn r = returnRepository.findByRentalId(rentalId)
                .orElseThrow(() -> new ResourceNotFoundException("No se encontró registro de devolución para el alquiler ID: " + rentalId));
        return mapToResponse(r);
    }

    private ReturnResponse mapToResponse(RentalReturn r) {
        BigDecimal totalPenalties = BigDecimal.ZERO;
        List<ReturnResponse.DamageResponse> damageResponses = new ArrayList<>();

        if (r.getDamages() != null) {
            for (var d : r.getDamages()) {
                totalPenalties = totalPenalties.add(d.getPenaltyAmount() != null ? d.getPenaltyAmount() : BigDecimal.ZERO);
                damageResponses.add(new ReturnResponse.DamageResponse(
                        d.getId(),
                        d.getDescription(),
                        d.getSeverity(),
                        d.getPenaltyAmount()
                ));
            }
        }

        return ReturnResponse.builder()
                .id(r.getId())
                .rentalId(r.getRental().getId())
                .returnDate(r.getReturnDate())
                .status(r.getStatus())
                .generalNotes(r.getGeneralNotes())
                .inspectorNotes(r.getInspectorNotes())
                .createdAt(r.getCreatedAt())
                .totalPenalties(totalPenalties)
                .damages(damageResponses)
                .build();
    }
}
