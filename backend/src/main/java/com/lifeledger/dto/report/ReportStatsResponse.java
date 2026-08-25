package com.lifeledger.dto.report;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportStatsResponse {
    private long totalDocuments;
    private long totalStorageBytes;
    private String formattedStorage;
    private int readinessScore;
    private String readinessLevel;
    private int riskScore;
    private String riskLevel;
    private long totalNominees;
    private long verifiedNominees;
    private long totalPolicies;
    private long activePolicies;
    private long pendingEmergencyRequests;
    private long approvedEmergencyRequests;
    private List<CategoryStat> categoryStats;
    private List<RecentActivityStat> recentActivities;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryStat {
        private String categoryName;
        private long documentCount;
        private long storageBytes;
        private double percentage;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RecentActivityStat {
        private String action;
        private String targetResource;
        private String details;
        private String timestamp;
    }
}
