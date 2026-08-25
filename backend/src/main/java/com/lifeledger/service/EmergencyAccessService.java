package com.lifeledger.service;

import com.lifeledger.dto.emergency.EmergencyRequestCreate;
import com.lifeledger.entity.*;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.exception.SecurityViolationException;
import com.lifeledger.repository.*;
import com.lifeledger.util.FileValidationUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmergencyAccessService {

    private final EmergencyRequestRepository emergencyRequestRepository;
    private final EmergencyEvidenceRepository evidenceRepository;
    private final PolicyRepository policyRepository;
    private final PolicyDocumentRepository policyDocumentRepository;
    private final NomineeRepository nomineeRepository;
    private final UserRepository userRepository;
    private final EncryptionService encryptionService;
    private final StorageService storageService;
    private final MetadataExtractorService metadataExtractorService;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Transactional
    public EmergencyRequestCreate.EmergencyResponseDto submitRequest(User nomineeUser, Long policyId,
                                                                    String reason, MultipartFile evidenceFile,
                                                                    HttpServletRequest request) {
        Policy policy = policyRepository.findById(policyId)
                .orElseThrow(() -> new ResourceNotFoundException("Policy not found"));

        if (!policy.isActive()) {
            throw new IllegalArgumentException("Cannot submit request: This legacy policy is disabled.");
        }

        Nominee nominee = policy.getNominee();
        if (nominee.getNomineeUser() == null || !nominee.getNomineeUser().getId().equals(nomineeUser.getId())) {
            // Check if email matches
            if (!nominee.getEmail().equalsIgnoreCase(nomineeUser.getEmail())) {
                throw new SecurityViolationException("You are not the designated nominee for this policy.");
            }
        }

        LocalDateTime now = LocalDateTime.now();
        int waitingHours = policy.getWaitingPeriodHours() != null ? policy.getWaitingPeriodHours() : 0;
        LocalDateTime waitingEnds = now.plusHours(waitingHours);

        EmergencyRequest emergencyRequest = EmergencyRequest.builder()
                .nominee(nominee)
                .policy(policy)
                .owner(policy.getOwner())
                .reason(reason.trim())
                .status(EmergencyRequest.EmergencyStatus.PENDING)
                .requestedAt(now)
                .waitingPeriodEndsAt(waitingEnds)
                .build();

        EmergencyRequest saved = emergencyRequestRepository.save(emergencyRequest);

        // Upload and encrypt proof evidence if attached
        if (evidenceFile != null && !evidenceFile.isEmpty()) {
            try {
                byte[] fileBytes = evidenceFile.getBytes();
                String originalFilename = FileValidationUtils.sanitizeFilename(evidenceFile.getOriginalFilename());
                String detectedMime = metadataExtractorService.detectMimeType(fileBytes, originalFilename);

                FileValidationUtils.validateFile(evidenceFile, detectedMime);

                byte[] encryptedBytes = encryptionService.encrypt(fileBytes);
                String storagePath = storageService.storeEvidenceFile(encryptedBytes, originalFilename);

                EmergencyEvidence evidence = EmergencyEvidence.builder()
                        .emergencyRequest(saved)
                        .originalFilename(originalFilename)
                        .encryptedStoragePath(storagePath)
                        .mimeType(detectedMime)
                        .fileSize(evidenceFile.getSize())
                        .build();

                evidenceRepository.save(evidence);
                saved.getEvidences().add(evidence);
            } catch (Exception e) {
                log.error("Failed to store encrypted evidence: {}", e.getMessage());
            }
        }

        // Notify vault owner
        notificationService.createNotification(policy.getOwner(), "URGENT: Emergency Access Requested",
                nominee.getName() + " (" + nominee.getEmail() + ") requested emergency access under policy '" + policy.getName() + "'.",
                Notification.NotificationType.EMERGENCY, "/emergency-requests");

        // Notify admins
        List<User> admins = userRepository.findByRole(Role.ROLE_ADMIN);
        for (User admin : admins) {
            notificationService.createNotification(admin, "Emergency Access Alert",
                    "Emergency access request #" + saved.getId() + " logged for user " + policy.getOwner().getEmail(),
                    Notification.NotificationType.EMERGENCY, "/admin/emergency");
        }

        auditLogService.logActivity(nomineeUser, ActivityLog.ActivityAction.EMERGENCY_REQUEST,
                "EMERGENCY-" + saved.getId(), "Submitted emergency request for policy: " + policy.getName(), request);

        return mapToDto(saved);
    }

    @Transactional
    public EmergencyRequestCreate.EmergencyResponseDto reviewRequest(User reviewerUser, Long requestId,
                                                                    EmergencyRequestCreate.ReviewEmergencyDto dto,
                                                                    HttpServletRequest request) {
        EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found"));

        Policy policy = emergencyRequest.getPolicy();
        User owner = emergencyRequest.getOwner();

        boolean isOwner = owner.getId().equals(reviewerUser.getId());
        boolean isAdmin = reviewerUser.getRole() == Role.ROLE_ADMIN;

        if (!isOwner && !isAdmin) {
            throw new SecurityViolationException("You are not authorized to review this emergency request");
        }

        LocalDateTime now = LocalDateTime.now();

        if (Boolean.TRUE.equals(dto.getApprove())) {
            emergencyRequest.setStatus(EmergencyRequest.EmergencyStatus.APPROVED);
            emergencyRequest.setReviewedByUser(reviewerUser);
            emergencyRequest.setReviewedAt(now);
            emergencyRequest.setReviewNotes(dto.getReviewNotes());

            emergencyRequest.setAccessStartsAt(now);
            int accessHours = policy.getAccessDurationHours() != null ? policy.getAccessDurationHours() : 48;
            emergencyRequest.setAccessExpiresAt(now.plusHours(accessHours));

            // Notify nominee
            if (emergencyRequest.getNominee().getNomineeUser() != null) {
                notificationService.createNotification(emergencyRequest.getNominee().getNomineeUser(),
                        "Emergency Access Approved",
                        "Your request for policy '" + policy.getName() + "' was approved. Temporary access is active for " + accessHours + " hours.",
                        Notification.NotificationType.EMERGENCY, "/nominee/documents");
            }

            auditLogService.logActivity(reviewerUser, ActivityLog.ActivityAction.APPROVE_REQUEST,
                    "EMERGENCY-" + emergencyRequest.getId(), "Approved emergency access request. Active until: " + emergencyRequest.getAccessExpiresAt(), request);
            auditLogService.logActivity(reviewerUser, ActivityLog.ActivityAction.ACCESS_GRANTED,
                    "EMERGENCY-" + emergencyRequest.getId(), "Temporary document access window activated", request);

        } else {
            emergencyRequest.setStatus(EmergencyRequest.EmergencyStatus.REJECTED);
            emergencyRequest.setReviewedByUser(reviewerUser);
            emergencyRequest.setReviewedAt(now);
            emergencyRequest.setReviewNotes(dto.getReviewNotes());

            if (emergencyRequest.getNominee().getNomineeUser() != null) {
                notificationService.createNotification(emergencyRequest.getNominee().getNomineeUser(),
                        "Emergency Access Rejected",
                        "Your request for policy '" + policy.getName() + "' was rejected. Reason: " + (dto.getReviewNotes() != null ? dto.getReviewNotes() : "Not specified"),
                        Notification.NotificationType.EMERGENCY, "/nominee/history");
            }

            auditLogService.logActivity(reviewerUser, ActivityLog.ActivityAction.REJECT_REQUEST,
                    "EMERGENCY-" + emergencyRequest.getId(), "Rejected emergency access request", request);
        }

        return mapToDto(emergencyRequestRepository.save(emergencyRequest));
    }

    @Transactional
    public void cancelRequest(User user, Long requestId, HttpServletRequest request) {
        EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found"));

        boolean isNominee = emergencyRequest.getNominee().getNomineeUser() != null &&
                emergencyRequest.getNominee().getNomineeUser().getId().equals(user.getId());
        boolean isOwner = emergencyRequest.getOwner().getId().equals(user.getId());

        if (!isNominee && !isOwner && user.getRole() != Role.ROLE_ADMIN) {
            throw new SecurityViolationException("Not authorized to cancel this request");
        }

        emergencyRequest.setStatus(EmergencyRequest.EmergencyStatus.CANCELLED);
        emergencyRequestRepository.save(emergencyRequest);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.UPDATE_POLICY,
                "EMERGENCY-" + requestId, "Cancelled emergency request", request);
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestCreate.EmergencyResponseDto> getRequestsForOwner(User owner) {
        return emergencyRequestRepository.findByOwnerOrderByRequestedAtDesc(owner).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestCreate.EmergencyResponseDto> getRequestsForNomineeUser(User nomineeUser) {
        List<Nominee> nominees = nomineeRepository.findByNomineeUser(nomineeUser);
        nominees.addAll(nomineeRepository.findByEmail(nomineeUser.getEmail()));

        List<EmergencyRequest> allRequests = new ArrayList<>();
        for (Nominee n : nominees) {
            allRequests.addAll(emergencyRequestRepository.findByNomineeOrderByRequestedAtDesc(n));
        }

        return allRequests.stream()
                .distinct()
                .sorted((a, b) -> b.getRequestedAt().compareTo(a.getRequestedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestCreate.EmergencyResponseDto> getAllRequestsForAdmin() {
        return emergencyRequestRepository.findAll().stream()
                .sorted((a, b) -> b.getRequestedAt().compareTo(a.getRequestedAt()))
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<EmergencyRequestCreate.AccessibleDocumentDto> getAccessibleDocuments(User nomineeUser, Long requestId) {
        EmergencyRequest emergencyRequest = emergencyRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Emergency request not found"));

        if (emergencyRequest.getStatus() != EmergencyRequest.EmergencyStatus.APPROVED) {
            throw new SecurityViolationException("Access is not approved for this request.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (emergencyRequest.getAccessExpiresAt() == null || now.isAfter(emergencyRequest.getAccessExpiresAt())) {
            throw new SecurityViolationException("Temporary emergency access window has expired.");
        }

        List<PolicyDocument> policyDocs = policyDocumentRepository.findByPolicy(emergencyRequest.getPolicy());
        return policyDocs.stream()
                .map(pd -> {
                    Document doc = pd.getDocument();
                    return EmergencyRequestCreate.AccessibleDocumentDto.builder()
                            .documentId(doc.getId())
                            .title(doc.getTitle())
                            .categoryName(doc.getCategory() != null ? doc.getCategory().getName() : "Uncategorized")
                            .originalFilename(doc.getOriginalFilename())
                            .fileSize(doc.getFileSize())
                            .mimeType(doc.getMimeType())
                            .build();
                })
                .collect(Collectors.toList());
    }

    public EmergencyRequestCreate.EmergencyResponseDto mapToDto(EmergencyRequest req) {
        LocalDateTime now = LocalDateTime.now();
        boolean waitingPeriodPassed = req.getWaitingPeriodEndsAt() == null || now.isAfter(req.getWaitingPeriodEndsAt());

        boolean accessActive = false;
        long remainingMinutes = 0;
        if (req.getStatus() == EmergencyRequest.EmergencyStatus.APPROVED &&
                req.getAccessStartsAt() != null && req.getAccessExpiresAt() != null) {
            if (now.isAfter(req.getAccessStartsAt()) && now.isBefore(req.getAccessExpiresAt())) {
                accessActive = true;
                remainingMinutes = Duration.between(now, req.getAccessExpiresAt()).toMinutes();
            }
        }

        List<EmergencyEvidence> evidences = evidenceRepository.findByEmergencyRequest(req);
        List<EmergencyRequestCreate.EvidenceDto> evidenceDtos = evidences.stream()
                .map(e -> EmergencyRequestCreate.EvidenceDto.builder()
                        .id(e.getId())
                        .originalFilename(e.getOriginalFilename())
                        .mimeType(e.getMimeType())
                        .fileSize(e.getFileSize())
                        .uploadedAt(e.getUploadedAt())
                        .build())
                .collect(Collectors.toList());

        List<PolicyDocument> pDocs = policyDocumentRepository.findByPolicy(req.getPolicy());
        List<EmergencyRequestCreate.AccessibleDocumentDto> accessibleDocs = pDocs.stream()
                .map(pd -> EmergencyRequestCreate.AccessibleDocumentDto.builder()
                        .documentId(pd.getDocument().getId())
                        .title(pd.getDocument().getTitle())
                        .categoryName(pd.getDocument().getCategory() != null ? pd.getDocument().getCategory().getName() : "Uncategorized")
                        .originalFilename(pd.getDocument().getOriginalFilename())
                        .fileSize(pd.getDocument().getFileSize())
                        .mimeType(pd.getDocument().getMimeType())
                        .build())
                .collect(Collectors.toList());

        return EmergencyRequestCreate.EmergencyResponseDto.builder()
                .id(req.getId())
                .policyId(req.getPolicy().getId())
                .policyName(req.getPolicy().getName())
                .ownerId(req.getOwner().getId())
                .ownerName(req.getOwner().getFullName())
                .ownerEmail(req.getOwner().getEmail())
                .nomineeId(req.getNominee().getId())
                .nomineeName(req.getNominee().getName())
                .nomineeEmail(req.getNominee().getEmail())
                .reason(req.getReason())
                .status(req.getStatus())
                .reviewNotes(req.getReviewNotes())
                .requestedAt(req.getRequestedAt())
                .waitingPeriodEndsAt(req.getWaitingPeriodEndsAt())
                .waitingPeriodPassed(waitingPeriodPassed)
                .reviewedAt(req.getReviewedAt())
                .accessStartsAt(req.getAccessStartsAt())
                .accessExpiresAt(req.getAccessExpiresAt())
                .accessActive(accessActive)
                .remainingAccessMinutes(remainingMinutes)
                .evidences(evidenceDtos)
                .accessibleDocuments(accessibleDocs)
                .createdAt(req.getCreatedAt())
                .build();
    }
}
