package com.opusrentals.modules.rental.repository;

import com.opusrentals.modules.rental.entity.RentalClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalClaimRepository extends JpaRepository<RentalClaim, Long> {

    List<RentalClaim> findByRentalIdOrderByIdDesc(Long rentalId);

    List<RentalClaim> findByClientIdOrderByIdDesc(Long clientId);

    @Query("SELECT c FROM RentalClaim c WHERE c.rental.tool.provider.id = :providerId ORDER BY c.id DESC")
    List<RentalClaim> findByProviderId(@Param("providerId") Long providerId);

    List<RentalClaim> findAllByOrderByIdDesc();

    long countByRentalToolProviderId(Long providerId);

    long countByRentalToolProviderIdAndClaimType(Long providerId, String claimType);
}
