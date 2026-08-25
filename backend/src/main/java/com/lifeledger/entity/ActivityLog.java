package com.lifeledger.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "activity_logs", indexes = {
        @Index(name = "idx_audit_user", columnList = "user_id"),
        @Index(name = "idx_audit_action", columnList = "action"),
        @Index(name = "idx_audit_time", columnList = "created_at")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityLog {

    public enum ActivityAction {
        LOGIN,
        LOGOUT,
        FAILED_LOGIN,
        REGISTER,
        PASSWORD_CHANGED,
        PROFILE_UPDATED,
        UPLOAD_DOCUMENT,
        DOWNLOAD_DOCUMENT,
        VIEW_DOCUMENT,
        UPDATE_DOCUMENT,
        DELETE_DOCUMENT,
        RESTORE_DOCUMENT,
        PERMANENT_DELETE_DOCUMENT,
        ADD_NOMINEE,
        UPDATE_NOMINEE,
        REMOVE_NOMINEE,
        VERIFY_NOMINEE,
        CREATE_POLICY,
        UPDATE_POLICY,
        DELETE_POLICY,
        EMERGENCY_REQUEST,
        APPROVE_REQUEST,
        REJECT_REQUEST,
        ACCESS_GRANTED,
        ACCESS_EXPIRED,
        ADMIN_ACTION
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    @Column(name = "user_email", length = 150)
    private String userEmail;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private ActivityAction action;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 255)
    private String userAgent;

    @Column(name = "target_resource", length = 255)
    private String targetResource;

    @Column(length = 1000)
    private String details;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
