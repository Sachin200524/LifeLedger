package com.lifeledger.service;

import com.lifeledger.dto.report.ReportStatsResponse;
import com.lifeledger.dto.score.ReadinessScoreResponse;
import com.lifeledger.dto.score.RiskScoreResponse;
import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.Document;
import com.lifeledger.entity.EmergencyRequest;
import com.lifeledger.entity.User;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.repository.EmergencyRequestRepository;
import com.lifeledger.repository.NomineeRepository;
import com.lifeledger.repository.PolicyRepository;
import com.lifeledger.util.FileValidationUtils;
import com.lowagie.text.*;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.awt.Color;
import java.io.ByteArrayOutputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReportService {

    private final DocumentRepository documentRepository;
    private final NomineeRepository nomineeRepository;
    private final PolicyRepository policyRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final ReadinessScoringService readinessScoringService;
    private final RiskScoringService riskScoringService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public ReportStatsResponse getStatsForUser(User user) {
        long totalDocs = documentRepository.countByUserAndDeletedFalse(user);
        long storageBytes = documentRepository.sumFileSizeByUser(user);
        ReadinessScoreResponse readiness = readinessScoringService.calculateAndSaveReadiness(user);
        RiskScoreResponse risk = riskScoringService.calculateAndSaveRisk(user);
        long totalNominees = nomineeRepository.countByOwner(user);
        long verifiedNominees = nomineeRepository.countByOwnerAndVerificationStatus(user, com.lifeledger.entity.Nominee.VerificationStatus.VERIFIED);
        long totalPolicies = policyRepository.countByOwner(user);
        long activePolicies = policyRepository.countByOwnerAndActiveTrue(user);
        long pendingEmerg = emergencyRequestRepository.countByOwnerAndStatus(user, EmergencyRequest.EmergencyStatus.PENDING);
        long approvedEmerg = emergencyRequestRepository.countByOwnerAndStatus(user, EmergencyRequest.EmergencyStatus.APPROVED);

        List<Object[]> catRows = documentRepository.countDocumentsByCategoryForUser(user);
        List<ReportStatsResponse.CategoryStat> catStats = new ArrayList<>();
        for (Object[] row : catRows) {
            String catName = (String) row[0];
            long count = (Long) row[1];
            double pct = totalDocs > 0 ? ((double) count / totalDocs) * 100.0 : 0;
            catStats.add(ReportStatsResponse.CategoryStat.builder()
                    .categoryName(catName)
                    .documentCount(count)
                    .percentage(Math.round(pct * 10.0) / 10.0)
                    .build());
        }

        List<ActivityLog> logs = auditLogService.getRecentUserLogs(user);
        List<ReportStatsResponse.RecentActivityStat> actStats = new ArrayList<>();
        DateTimeFormatter dtf = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
        for (ActivityLog l : logs) {
            actStats.add(ReportStatsResponse.RecentActivityStat.builder()
                    .action(l.getAction().name())
                    .targetResource(l.getTargetResource())
                    .details(l.getDetails())
                    .timestamp(l.getCreatedAt() != null ? l.getCreatedAt().format(dtf) : "")
                    .build());
        }

        return ReportStatsResponse.builder()
                .totalDocuments(totalDocs)
                .totalStorageBytes(storageBytes)
                .formattedStorage(FileValidationUtils.formatFileSize(storageBytes))
                .readinessScore(readiness.getOverallScore())
                .readinessLevel(readiness.getLevel().name())
                .riskScore(risk.getOverallScore())
                .riskLevel(risk.getRiskLevel().name())
                .totalNominees(totalNominees)
                .verifiedNominees(verifiedNominees)
                .totalPolicies(totalPolicies)
                .activePolicies(activePolicies)
                .pendingEmergencyRequests(pendingEmerg)
                .approvedEmergencyRequests(approvedEmerg)
                .categoryStats(catStats)
                .recentActivities(actStats)
                .build();
    }

    @Transactional(readOnly = true)
    public byte[] generatePdfReport(User user) {
        ReportStatsResponse stats = getStatsForUser(user);
        List<Document> documents = documentRepository.findByUserAndDeletedFalseOrderByCreatedAtDesc(user);

        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            com.lowagie.text.Document pdfDoc = new com.lowagie.text.Document(PageSize.A4, 36, 36, 54, 36);
            PdfWriter.getInstance(pdfDoc, out);
            pdfDoc.open();

            // Styling fonts
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new Color(15, 23, 42));
            Font subtitleFont = FontFactory.getFont(FontFactory.HELVETICA, 11, new Color(100, 116, 139));
            Font sectionFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 13, new Color(22, 101, 52));
            Font boldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, Color.BLACK);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10, new Color(51, 65, 85));

            // Header Banner
            Paragraph title = new Paragraph("LIFELEDGER+ DIGITAL ESTATE & VAULT AUDIT REPORT", titleFont);
            title.setAlignment(Element.ALIGN_LEFT);
            pdfDoc.add(title);

            Paragraph meta = new Paragraph("Generated on: " + LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm:ss")) +
                    "  |  Account: " + user.getEmail() + " (" + user.getFullName() + ")", subtitleFont);
            meta.setSpacingAfter(15);
            pdfDoc.add(meta);

            // Summary Table
            Paragraph sec1 = new Paragraph("1. VAULT & SECURITY METRICS OVERVIEW", sectionFont);
            sec1.setSpacingAfter(8);
            pdfDoc.add(sec1);

            PdfPTable summaryTable = new PdfPTable(4);
            summaryTable.setWidthPercentage(100);
            summaryTable.setSpacingAfter(15);

            addCell(summaryTable, "Total Documents", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, String.valueOf(stats.getTotalDocuments()), normalFont, Color.WHITE);
            addCell(summaryTable, "Storage Consumed", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, stats.getFormattedStorage(), normalFont, Color.WHITE);

            addCell(summaryTable, "Readiness Score", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, stats.getReadinessScore() + "/100 (" + stats.getReadinessLevel() + ")", normalFont, Color.WHITE);
            addCell(summaryTable, "Digital Risk Score", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, stats.getRiskScore() + "/100 (" + stats.getRiskLevel() + ")", normalFont, Color.WHITE);

            addCell(summaryTable, "Designated Nominees", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, stats.getTotalNominees() + " (" + stats.getVerifiedNominees() + " verified)", normalFont, Color.WHITE);
            addCell(summaryTable, "Emergency Policies", boldFont, new Color(241, 245, 249));
            addCell(summaryTable, stats.getActivePolicies() + " active of " + stats.getTotalPolicies(), normalFont, Color.WHITE);

            pdfDoc.add(summaryTable);

            // Document Inventory Table
            Paragraph sec2 = new Paragraph("2. SECURE DOCUMENT INVENTORY (AES-256 ENCRYPTED)", sectionFont);
            sec2.setSpacingAfter(8);
            pdfDoc.add(sec2);

            PdfPTable docTable = new PdfPTable(5);
            docTable.setWidthPercentage(100);
            docTable.setWidths(new float[]{30, 20, 15, 18, 17});
            docTable.setSpacingAfter(15);

            addHeaderCell(docTable, "Title", boldFont);
            addHeaderCell(docTable, "Category", boldFont);
            addHeaderCell(docTable, "Size", boldFont);
            addHeaderCell(docTable, "Expiry Date", boldFont);
            addHeaderCell(docTable, "Status", boldFont);

            for (Document d : documents) {
                addCell(docTable, d.getTitle(), normalFont, Color.WHITE);
                addCell(docTable, d.getCategory() != null ? d.getCategory().getName() : "-", normalFont, Color.WHITE);
                addCell(docTable, FileValidationUtils.formatFileSize(d.getFileSize()), normalFont, Color.WHITE);
                addCell(docTable, d.getExpiryDate() != null ? d.getExpiryDate().toString() : "None", normalFont, Color.WHITE);
                boolean expired = d.getExpiryDate() != null && d.getExpiryDate().isBefore(java.time.LocalDate.now());
                addCell(docTable, expired ? "EXPIRED" : "SECURED", normalFont, Color.WHITE);
            }

            pdfDoc.add(docTable);

            // Disclaimer Footer
            Paragraph disclaimer = new Paragraph("CONFIDENTIAL DOCUMENT — Generated securely by LifeLedger+. " +
                    "All stored documents are encrypted at rest with AES-256-GCM. Digital legacy access is restricted by policy controls.", subtitleFont);
            disclaimer.setSpacingBefore(10);
            pdfDoc.add(disclaimer);

            pdfDoc.close();
            return out.toByteArray();
        } catch (Exception e) {
            log.error("Failed to generate PDF report: {}", e.getMessage(), e);
            throw new RuntimeException("Could not generate PDF audit report", e);
        }
    }

    private void addHeaderCell(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(220, 252, 231));
        cell.setPadding(6);
        table.addCell(cell);
    }

    private void addCell(PdfPTable table, String text, Font font, Color bgColor) {
        PdfPCell cell = new PdfPCell(new Phrase(text != null ? text : "-", font));
        cell.setBackgroundColor(bgColor);
        cell.setPadding(6);
        table.addCell(cell);
    }
}
