package com.opusrentals.modules.rental.repository;

import com.opusrentals.modules.rental.entity.RentalDamage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RentalDamageRepository extends JpaRepository<RentalDamage, Long> {
    List<RentalDamage> findByRentalReturnId(Long returnId);
}
