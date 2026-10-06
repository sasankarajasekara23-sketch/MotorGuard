package com.insurance.document;

import com.insurance.claim.Claim;
import com.insurance.policy.Policy;
import com.insurance.user.User;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "documents")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Document {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String fileName;

    @Column(nullable = false)
    private String mimeType;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] fileData;

    @ManyToOne
    @JoinColumn(name = "claim_id")
    private Claim claim;

    @ManyToOne
    @JoinColumn(name = "policy_id")
    private Policy policy;

    @ManyToOne(optional = false)
    @JoinColumn(name = "user_id")
    private User uploadedBy;

    @Column(nullable = false)
    private LocalDateTime uploadedAt = LocalDateTime.now();
}
