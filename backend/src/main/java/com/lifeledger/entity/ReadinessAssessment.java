package com.lifeledger.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "readiness_assessments", indexes = {
        @Index(name = "idx_readiness_user", columnList = "user_id")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReadinessAssessment {

    public enum ReadinessLevel {
        POOR,
        NEEDS_IMPROVEMENT,
        GOOD,
        EXCELLENT
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    @Column(name = "overall_score", nullable = false)
    private int overallScore; // 0-100

    @Column(name = "documents_score", nullable = false)
    private int documentsScore; // Max 30

    @Column(name = "nominee_score", nullable = false)
    private int nomineeScore; // Max 20

    @Column(name = "policy_score", nullable = false)
    private int policyScore; // Max 20

    @Column(name = "security_score", nullable = false)
    private int securityScore; // Max 15

    @Column(name = "emergency_score", nullable = false)
    private int emergencyScore; // Max 15

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ReadinessLevel level;

    @Lob
    @Column(name = "recommendations_json", columnDefinition = "TEXT")
    private String recommendationsJson;

    @CreationTimestamp
    @Column(name = "calculated_at", nullable = false, updatable = false)
    private LocalDateTime calculatedAt;
}
