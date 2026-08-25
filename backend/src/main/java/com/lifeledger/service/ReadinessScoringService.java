package com.lifeledger.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeledger.dto.score.ReadinessScoreResponse;
import com.lifeledger.entity.*;
import com.lifeledger.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReadinessScoringService {

    private final ReadinessAssessmentRepository readinessRepository;
    private final DocumentRepository documentRepository;
    private final NomineeRepository nomineeRepository;
    private final PolicyRepository policyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public ReadinessScoreResponse calculateAndSaveReadiness(User user) {
        // 1. Documents Score (Max 30)
        long docCount = documentRepository.countByUserAndDeletedFalse(user);
        List<Document> docs = documentRepository.findByUserAndDeletedFalseOrderByCreatedAtDesc(user);
        long uniqueCategories = docs.stream().map(d -> d.getCategory().getId()).distinct().count();

        int docScore = (int) Math.min(docCount * 4, 18);
        if (uniqueCategories >= 2) docScore += 4;
        if (uniqueCategories >= 4) docScore += 4;
        if (uniqueCategories >= 6) docScore += 4;
        docScore = Math.min(docScore, 30);

        // 2. Nominee Score (Max 20)
        long totalNominees = nomineeRepository.countByOwner(user);
        long verifiedNominees = nomineeRepository.countByOwnerAndVerificationStatus(user, Nominee.VerificationStatus.VERIFIED);
        int nomineeScore = 0;
        if (totalNominees > 0) nomineeScore += 10;
        if (verifiedNominees > 0) nomineeScore += 10;

        // 3. Policy Score (Max 20)
        long activePolicies = policyRepository.countByOwnerAndActiveTrue(user);
        int policyScore = 0;
        if (activePolicies >= 1) policyScore += 12;
        if (activePolicies >= 2) policyScore += 8;
        policyScore = Math.min(policyScore, 20);

        // 4. Security Score (Max 15)
        int securityScore = 10;
        if (user.isTwoFactorEnabled()) securityScore += 5;
        if (user.getFailedLoginAttempts() == 0) securityScore = Math.min(securityScore + 2, 15);

        // 5. Emergency Score (Max 15)
        int emergencyScore = 0;
        if (activePolicies > 0 && verifiedNominees > 0) {
            emergencyScore += 10;
            // Check if policies have waiting period configured
            boolean hasWaitingPeriod = policyRepository.findByOwnerOrderByCreatedAtDesc(user).stream()
                    .anyMatch(p -> p.getWaitingPeriodHours() != null && p.getWaitingPeriodHours() > 0);
            if (hasWaitingPeriod) emergencyScore += 5;
        }

        int total = docScore + nomineeScore + policyScore + securityScore + emergencyScore;
        total = Math.min(Math.max(total, 0), 100);

        ReadinessAssessment.ReadinessLevel level;
        if (total >= 80) level = ReadinessAssessment.ReadinessLevel.EXCELLENT;
        else if (total >= 60) level = ReadinessAssessment.ReadinessLevel.GOOD;
        else if (total >= 40) level = ReadinessAssessment.ReadinessLevel.NEEDS_IMPROVEMENT;
        else level = ReadinessAssessment.ReadinessLevel.POOR;

        List<String> recommendations = new ArrayList<>();
        if (docCount < 3) recommendations.add("Upload key identity, property, and financial documents to reach core readiness.");
        if (uniqueCategories < 3) recommendations.add("Diversify your vault with medical, insurance, and legal categories.");
        if (totalNominees == 0) recommendations.add("Designate at least one trusted nominee to ensure digital legacy continuity.");
        else if (verifiedNominees == 0) recommendations.add("Ensure your designated nominees accept their verification invitation.");
        if (activePolicies == 0) recommendations.add("Create an emergency access policy to configure waiting periods and authorized documents.");
        if (!user.isTwoFactorEnabled()) recommendations.add("Enable Two-Factor Authentication in profile settings to harden security.");

        if (recommendations.isEmpty()) {
            recommendations.add("Your digital legacy vault is primed with top-tier security and readiness!");
        }

        // Persist assessment history
        try {
            ReadinessAssessment assessment = ReadinessAssessment.builder()
                    .user(user)
                    .overallScore(total)
                    .documentsScore(docScore)
                    .nomineeScore(nomineeScore)
                    .policyScore(policyScore)
                    .securityScore(securityScore)
                    .emergencyScore(emergencyScore)
                    .level(level)
                    .recommendationsJson(objectMapper.writeValueAsString(recommendations))
                    .build();
            readinessRepository.save(assessment);
        } catch (Exception e) {
            log.error("Could not serialize readiness recommendations: {}", e.getMessage());
        }

        List<ReadinessScoreResponse.BreakdownItem> breakdown = List.of(
                new ReadinessScoreResponse.BreakdownItem("Document Coverage", docScore, 30, docScore > 20 ? "Good" : "Needs Attention", docCount + " documents across " + uniqueCategories + " categories"),
                new ReadinessScoreResponse.BreakdownItem("Nominee Designation", nomineeScore, 20, nomineeScore == 20 ? "Verified" : "Pending", verifiedNominees + " of " + totalNominees + " nominees verified"),
                new ReadinessScoreResponse.BreakdownItem("Policy Rules", policyScore, 20, policyScore > 10 ? "Active" : "Missing", activePolicies + " active emergency policies configured"),
                new ReadinessScoreResponse.BreakdownItem("Security Posture", securityScore, 15, securityScore > 10 ? "Strong" : "Moderate", user.isTwoFactorEnabled() ? "2FA Enabled, AES-256 Vault" : "AES-256 Vault, 2FA Recommended"),
                new ReadinessScoreResponse.BreakdownItem("Emergency Workflow", emergencyScore, 15, emergencyScore > 10 ? "Ready" : "Incomplete", "Configured access gates and approval timeouts")
        );

        return ReadinessScoreResponse.builder()
                .overallScore(total)
                .documentsScore(docScore)
                .nomineeScore(nomineeScore)
                .policyScore(policyScore)
                .securityScore(securityScore)
                .emergencyScore(emergencyScore)
                .level(level)
                .recommendations(recommendations)
                .breakdown(breakdown)
                .calculatedAt(LocalDateTime.now())
                .build();
    }
}
