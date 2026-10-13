package com.opusrentals.modules.billing.repository;

import com.opusrentals.modules.billing.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByInvoiceId(Long invoiceId);
    Optional<Payment> findByTransactionReference(String transactionReference);
}
