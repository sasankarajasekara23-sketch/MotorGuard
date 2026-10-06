package com.insurance.policy;

import com.insurance.vehicle.Vehicle;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "policies")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Policy {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "vehicle_id")
    private Vehicle vehicle;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyType policyType;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate endDate;

    @Column(nullable = false)
    private BigDecimal premiumAmount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private PolicyStatus status;
}
