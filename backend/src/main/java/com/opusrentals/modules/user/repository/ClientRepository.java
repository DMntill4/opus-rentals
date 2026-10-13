package com.opusrentals.modules.user.repository;

import com.opusrentals.modules.user.entity.Client;
import com.opusrentals.modules.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ClientRepository extends JpaRepository<Client, Long> {
    Optional<Client> findByUser(User user);
    Optional<Client> findByUserId(Long userId);
    boolean existsByDocumentTypeAndDocumentNumber(String documentType, String documentNumber);
}
