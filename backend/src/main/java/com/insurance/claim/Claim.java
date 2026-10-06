package com.insurance.claim;

import com.insurance.policy.Policy;
import com.insurance.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "claims")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Claim {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "policy_id")
    private Policy policy;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User submittedBy;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ClaimStatus status;

    private String reviewerNotes;

    @Column(nullable = false)
    private LocalDateTime submittedDate = LocalDateTime.now();
}
