package com.opusrentals.modules.user.repository;

import com.opusrentals.modules.user.entity.Provider;
import com.opusrentals.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ProviderRepository extends JpaRepository<Provider, Long> {
    Optional<Provider> findByUser(User user);
    Optional<Provider> findByUserId(Long userId);
    boolean existsByTaxId(String taxId);
}
