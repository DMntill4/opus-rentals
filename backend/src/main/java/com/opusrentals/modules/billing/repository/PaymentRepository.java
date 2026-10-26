package com.opusrentals.modules.billing.repository;

import com.opusrentals.modules.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);

    @Query("SELECT p FROM Payment p WHERE p.invoice.rental.client.id = :clientId ORDER BY p.paymentDate DESC")
    List<Payment> findByClientId(@Param("clientId") Long clientId);

    Optional<Payment> findByTransactionReference(String transactionReference);
}
