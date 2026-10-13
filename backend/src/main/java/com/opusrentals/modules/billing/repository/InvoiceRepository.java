package com.opusrentals.modules.billing.repository;

import com.opusrentals.modules.billing.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    Optional<Invoice> findByRentalId(Long rentalId);
    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    @Query("SELECT i FROM Invoice i WHERE i.rental.client.id = :clientId ORDER BY i.createdAt DESC")
    List<Invoice> findByClientId(@Param("clientId") Long clientId);

    @Query("SELECT i FROM Invoice i WHERE i.rental.tool.provider.id = :providerId ORDER BY i.createdAt DESC")
    List<Invoice> findByProviderId(@Param("providerId") Long providerId);
}
