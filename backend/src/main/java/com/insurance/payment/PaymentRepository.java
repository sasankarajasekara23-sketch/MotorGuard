package com.insurance.payment;

import com.insurance.payment.enums.PaymentStatus;
import com.insurance.payment.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID> {

    List<Payment> findByCustomerIdOrderByPaymentDateDesc(UUID customerId);

    List<Payment> findByPolicyIdOrderByPaymentDateDesc(UUID policyId);

    List<Payment> findByClaimIdOrderByPaymentDateDesc(UUID claimId);

    List<Payment> findAllByOrderByPaymentDateDesc();

    boolean existsByClaimIdAndStatus(UUID claimId, PaymentStatus status);

    boolean existsByPolicyIdAndPaymentTypeAndStatus(UUID policyId, PaymentType paymentType, PaymentStatus status);

    boolean existsByTransactionRef(String transactionRef);
}
