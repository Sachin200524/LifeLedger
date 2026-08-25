package com.lifeledger.dto.score;

import com.lifeledger.entity.RiskScore;
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
public class RiskScoreResponse {
    private int overallScore; // 0-100
    private RiskScore.RiskLevel riskLevel;
    private List<RiskFactorItem> factors;
    private List<String> suggestions;
    private LocalDateTime calculatedAt;
    @Builder.Default
    private String disclaimer = "This is an application-level digital legacy risk assessment based on document currency, nominee coverage, and security configurations. It does not constitute legal or financial counsel.";

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RiskFactorItem {
        private String factor;
        private int impactScore;
        private String severity; // LOW, MEDIUM, HIGH, CRITICAL
        private String description;
    }
}
