package com.lifeledger.service;

import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.Document;
import com.lifeledger.entity.EmergencyRequest;
import com.lifeledger.entity.Notification;
import com.lifeledger.entity.Policy;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.repository.EmergencyRequestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledTaskService {

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final DocumentRepository documentRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    /**
     * Runs every minute to auto-expire temporary emergency access sessions whose window has passed.
     */
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void processEmergencyAccessExpirations() {
        LocalDateTime now = LocalDateTime.now();
        List<EmergencyRequest> expiredRequests = emergencyRequestRepository
                .findByStatusAndAccessExpiresAtBefore(EmergencyRequest.EmergencyStatus.APPROVED, now);

        for (EmergencyRequest req : expiredRequests) {
            req.setStatus(EmergencyRequest.EmergencyStatus.EXPIRED);
            emergencyRequestRepository.save(req);

            log.info("Emergency access #{} automatically expired at {}", req.getId(), now);

            // Notify vault owner
            notificationService.createNotification(req.getOwner(), "Emergency Access Window Expired",
                    "Temporary document access for " + req.getNominee().getName() + " under policy '" +
                            req.getPolicy().getName() + "' has concluded and expired.",
                    Notification.NotificationType.EMERGENCY, "/emergency-requests");

            // Notify nominee
            if (req.getNominee().getNomineeUser() != null) {
                notificationService.createNotification(req.getNominee().getNomineeUser(), "Access Window Concluded",
                        "Your temporary emergency access under policy '" + req.getPolicy().getName() + "' has expired.",
                        Notification.NotificationType.EMERGENCY, "/nominee/history");
            }

            auditLogService.logActivity(req.getOwner(), ActivityLog.ActivityAction.ACCESS_EXPIRED,
                    "EMERGENCY-" + req.getId(), "Temporary emergency access auto-expired by system scheduler", null);
        }
    }

    /**
     * Checks for auto-approval timeout triggers every 5 minutes.
     */
    @Scheduled(fixedRate = 300000)
    @Transactional
    public void processAutoApprovalTimeouts() {
        LocalDateTime now = LocalDateTime.now();
        List<EmergencyRequest> pendingRequests = emergencyRequestRepository
                .findByStatusAndWaitingPeriodEndsAtBefore(EmergencyRequest.EmergencyStatus.PENDING, now);

        for (EmergencyRequest req : pendingRequests) {
            Policy policy = req.getPolicy();
            if (policy.getApprovalType() == Policy.ApprovalType.AUTO_AFTER_TIMEOUT) {
                req.setStatus(EmergencyRequest.EmergencyStatus.APPROVED);
                req.setReviewedAt(now);
                req.setReviewNotes("Auto-approved after mandatory waiting period of " + policy.getWaitingPeriodHours() + " hours elapsed.");
                req.setAccessStartsAt(now);
                int duration = policy.getAccessDurationHours() != null ? policy.getAccessDurationHours() : 48;
                req.setAccessExpiresAt(now.plusHours(duration));
                emergencyRequestRepository.save(req);

                notificationService.createNotification(req.getOwner(), "Emergency Request Auto-Approved",
                        "Emergency access for " + req.getNominee().getName() + " was auto-approved per policy configuration.",
                        Notification.NotificationType.EMERGENCY, "/emergency-requests");

                auditLogService.logActivity(req.getOwner(), ActivityLog.ActivityAction.APPROVE_REQUEST,
                        "EMERGENCY-" + req.getId(), "Auto-approved emergency access after timeout", null);
            }
        }
    }

    /**
     * Daily check at 8:00 AM for document expirations within the next 30 days.
     */
    @Scheduled(cron = "0 0 8 * * *")
    @Transactional
    public void checkDocumentExpirations() {
        LocalDate today = LocalDate.now();
        LocalDate in30Days = today.plusDays(30);

        List<Document> allActive = documentRepository.findAll();
        for (Document doc : allActive) {
            if (!doc.isDeleted() && doc.getExpiryDate() != null) {
                if (doc.getExpiryDate().isEqual(in30Days) || doc.getExpiryDate().isEqual(today.plusDays(7))) {
                    notificationService.createNotification(doc.getUser(), "Document Expiring Soon",
                            "Your document '" + doc.getTitle() + "' will expire on " + doc.getExpiryDate() + ".",
                            Notification.NotificationType.EXPIRY, "/vault");
                }
            }
        }
    }
}
