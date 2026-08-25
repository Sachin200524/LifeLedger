package com.lifeledger.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lifeledger.dto.score.RiskScoreResponse;
import com.lifeledger.entity.Document;
import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.RiskScore;
import com.lifeledger.entity.User;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.repository.NomineeRepository;
import com.lifeledger.repository.PolicyRepository;
import com.lifeledger.repository.RiskScoreRepository;
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
public class RiskScoringService {

    private final RiskScoreRepository riskScoreRepository;
    private final DocumentRepository documentRepository;
    private final NomineeRepository nomineeRepository;
    private final PolicyRepository policyRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public RiskScoreResponse calculateAndSaveRisk(User user) {
        int riskPoints = 0;
        List<RiskScoreResponse.RiskFactorItem> factors = new ArrayList<>();
        List<String> suggestions = new ArrayList<>();

        long totalDocs = documentRepository.countByUserAndDeletedFalse(user);
        long totalNominees = nomineeRepository.countByOwner(user);
        long verifiedNominees = nomineeRepository.countByOwnerAndVerificationStatus(user, Nominee.VerificationStatus.VERIFIED);
        long activePolicies = policyRepository.countByOwnerAndActiveTrue(user);

        // Factor 1: Nominee Absence
        if (totalNominees == 0) {
            riskPoints += 30;
            factors.add(new RiskScoreResponse.RiskFactorItem("No Trusted Nominee", 30, "CRITICAL", "No trusted contact is designated to retrieve documents in emergency scenarios."));
            suggestions.add("Add a trusted family member or legal representative as your designated nominee.");
        } else if (verifiedNominees == 0) {
            riskPoints += 15;
            factors.add(new RiskScoreResponse.RiskFactorItem("Unverified Nominees", 15, "HIGH", "Nominees have not completed invitation verification."));
            suggestions.add("Resend invitation link to your nominee and request verification.");
        }

        // Factor 2: Policy Absence
        if (activePolicies == 0) {
            riskPoints += 25;
            factors.add(new RiskScoreResponse.RiskFactorItem("Missing Emergency Policy", 25, "HIGH", "Without policies, nominees cannot legitimately request emergency access."));
            suggestions.add("Configure at least one legacy access policy binding specific documents and waiting periods.");
        }

        // Factor 3: Document Expiry
        LocalDate now = LocalDate.now();
        List<Document> userDocs = documentRepository.findByUserAndDeletedFalseOrderByCreatedAtDesc(user);
        long expiredDocs = userDocs.stream().filter(d -> d.getExpiryDate() != null && d.getExpiryDate().isBefore(now)).count();
        long expiringSoon = userDocs.stream().filter(d -> d.getExpiryDate() != null && !d.getExpiryDate().isBefore(now) && d.getExpiryDate().isBefore(now.plusDays(30))).count();

        if (expiredDocs > 0) {
            int impact = (int) Math.min(expiredDocs * 10, 20);
            riskPoints += impact;
            factors.add(new RiskScoreResponse.RiskFactorItem("Expired Documents Detected", impact, "HIGH", expiredDocs + " document(s) in your vault have expired."));
            suggestions.add("Review and upload renewed versions of expired documents.");
        }

        if (expiringSoon > 0) {
            riskPoints += 10;
            factors.add(new RiskScoreResponse.RiskFactorItem("Imminent Document Expirations", 10, "MEDIUM", expiringSoon + " document(s) expire within 30 days."));
            suggestions.add("Prepare renewals for documents nearing their expiration date.");
        }

        // Factor 4: Vault Sparsity
        if (totalDocs == 0) {
            riskPoints += 15;
            factors.add(new RiskScoreResponse.RiskFactorItem("Empty Vault", 15, "MEDIUM", "Vault contains no secured personal or legal documents."));
            suggestions.add("Upload identification, insurance, and medical records to begin securing your digital estate.");
        }

        // Factor 5: Security Hygiene
        if (!user.isTwoFactorEnabled()) {
            riskPoints += 10;
            factors.add(new RiskScoreResponse.RiskFactorItem("Single-Factor Authentication", 10, "LOW", "Two-factor verification is not yet enabled."));
            suggestions.add("Turn on 2FA for enhanced account protection.");
        }

        if (user.getFailedLoginAttempts() > 0) {
            riskPoints += 10;
            factors.add(new RiskScoreResponse.RiskFactorItem("Recent Unsuccessful Logins", 10, "MEDIUM", user.getFailedLoginAttempts() + " recent failed login attempt(s) recorded."));
            suggestions.add("Verify account security and consider updating your vault master password.");
        }

        int overallScore = Math.min(Math.max(riskPoints, 0), 100);

        RiskScore.RiskLevel riskLevel;
        if (overallScore <= 30) riskLevel = RiskScore.RiskLevel.LOW;
        else if (overallScore <= 60) riskLevel = RiskScore.RiskLevel.MEDIUM;
        else if (overallScore <= 80) riskLevel = RiskScore.RiskLevel.HIGH;
        else riskLevel = RiskScore.RiskLevel.CRITICAL;

        if (factors.isEmpty()) {
            factors.add(new RiskScoreResponse.RiskFactorItem("Optimal Security", 0, "LOW", "No prominent digital legacy risks detected."));
            suggestions.add("Keep documents updated regularly and review nominee permissions periodically.");
        }

        try {
            RiskScore scoreEntity = RiskScore.builder()
                    .user(user)
                    .overallScore(overallScore)
                    .riskLevel(riskLevel)
                    .factorsJson(objectMapper.writeValueAsString(factors))
                    .suggestionsJson(objectMapper.writeValueAsString(suggestions))
                    .build();
            riskScoreRepository.save(scoreEntity);
        } catch (Exception e) {
            log.error("Failed to save risk score entity: {}", e.getMessage());
        }

        return RiskScoreResponse.builder()
                .overallScore(overallScore)
                .riskLevel(riskLevel)
                .factors(factors)
                .suggestions(suggestions)
                .calculatedAt(LocalDateTime.now())
                .build();
    }
}
