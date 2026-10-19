package com.opusrentals.modules.rental.repository;

import com.opusrentals.modules.rental.entity.Rental;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RentalRepository extends JpaRepository<Rental, Long> {

    List<Rental> findByClientIdOrderByIdDesc(Long clientId);

    @Query("SELECT r FROM Rental r WHERE r.tool.provider.id = :providerId ORDER BY r.id DESC")
    List<Rental> findByProviderId(@Param("providerId") Long providerId);

    List<Rental> findByStatus(String status);

    @Query("SELECT COUNT(r) > 0 FROM Rental r WHERE r.tool.id = :toolId " +
           "AND r.status NOT IN ('CANCELLED', 'RETURNED') " +
           "AND r.startDate <= :endDate AND r.endDate >= :startDate")
    boolean hasOverlappingRentals(@Param("toolId") Long toolId,
                                  @Param("startDate") LocalDate startDate,
                                  @Param("endDate") LocalDate endDate);

    @Query("SELECT r FROM Rental r WHERE r.tool.id = :toolId AND r.status NOT IN ('CANCELLED', 'REJECTED')")
    List<Rental> findActiveRentalsByToolId(@Param("toolId") Long toolId);
}
