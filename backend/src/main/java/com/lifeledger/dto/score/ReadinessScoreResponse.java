package com.lifeledger.dto.score;

import com.lifeledger.entity.ReadinessAssessment;
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
public class ReadinessScoreResponse {
    private int overallScore; // 0-100
    private int documentsScore; // Max 30
    private int nomineeScore; // Max 20
    private int policyScore; // Max 20
    private int securityScore; // Max 15
    private int emergencyScore; // Max 15
    private ReadinessAssessment.ReadinessLevel level;
    private List<String> recommendations;
    private LocalDateTime calculatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class BreakdownItem {
        private String category;
        private int currentScore;
        private int maxScore;
        private String status;
        private String description;
    }

    private List<BreakdownItem> breakdown;
}
