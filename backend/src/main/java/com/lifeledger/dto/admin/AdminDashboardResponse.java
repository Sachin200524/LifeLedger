package com.lifeledger.dto.admin;

import com.lifeledger.entity.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AdminDashboardResponse {
    private long totalUsers;
    private long activeUsers;
    private long totalDocuments;
    private long totalStorageBytes;
    private String formattedTotalStorage;
    private long totalPolicies;
    private long pendingEmergencyRequests;
    private long totalEmergencyRequests;
    private double systemAverageReadiness;
    private double systemAverageRisk;
    private List<SystemCategoryBreakdown> categoryBreakdown;
    private List<RecentUserDto> recentUsers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SystemCategoryBreakdown {
        private String category;
        private long count;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentUserDto {
        private Long id;
        private String email;
        private String fullName;
        private Role role;
        private boolean active;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserAdminDto {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private Role role;
        private boolean active;
        private boolean twoFactorEnabled;
        private int failedLoginAttempts;
        private long documentCount;
        private long nomineeCount;
        private long policyCount;
        private LocalDateTime createdAt;
    }
}
