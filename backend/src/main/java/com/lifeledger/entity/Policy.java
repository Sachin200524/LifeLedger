package com.lifeledger.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "policies", indexes = {
        @Index(name = "idx_policy_owner", columnList = "owner_id"),
        @Index(name = "idx_policy_nominee", columnList = "nominee_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Policy {

    public enum ApprovalType {
        OWNER_ONLY,
        ADMIN_ONLY,
        OWNER_OR_ADMIN,
        AUTO_AFTER_TIMEOUT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    @JsonIgnore
    private User owner;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "nominee_id", nullable = false)
    private Nominee nominee;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(name = "waiting_period_hours", nullable = false)
    @Builder.Default
    private Integer waitingPeriodHours = 24;

    @Enumerated(EnumType.STRING)
    @Column(name = "approval_type", nullable = false, length = 30)
    @Builder.Default
    private ApprovalType approvalType = ApprovalType.OWNER_OR_ADMIN;

    @Column(name = "access_duration_hours", nullable = false)
    @Builder.Default
    private Integer accessDurationHours = 48;

    @Column(name = "policy_expiry_date")
    private LocalDate policyExpiryDate;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private boolean active = true;

    @OneToMany(mappedBy = "policy", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    @Builder.Default
    private List<PolicyDocument> policyDocuments = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
