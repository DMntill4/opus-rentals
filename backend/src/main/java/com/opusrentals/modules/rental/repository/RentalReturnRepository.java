package com.opusrentals.modules.rental.repository;

import com.opusrentals.modules.rental.entity.RentalReturn;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RentalReturnRepository extends JpaRepository<RentalReturn, Long> {
    Optional<RentalReturn> findByRentalId(Long rentalId);
}
