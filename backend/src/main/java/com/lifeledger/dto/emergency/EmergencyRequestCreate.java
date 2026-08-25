package com.lifeledger.dto.emergency;

import com.lifeledger.entity.EmergencyRequest;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class EmergencyRequestCreate {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateEmergencyDto {
        @NotNull(message = "Policy ID is required")
        private Long policyId;

        @NotBlank(message = "Reason for emergency access is required")
        private String reason;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ReviewEmergencyDto {
        @NotNull(message = "Approval decision is required")
        private Boolean approve;

        private String reviewNotes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EmergencyResponseDto {
        private Long id;
        private Long policyId;
        private String policyName;
        private Long ownerId;
        private String ownerName;
        private String ownerEmail;
        private Long nomineeId;
        private String nomineeName;
        private String nomineeEmail;
        private String reason;
        private EmergencyRequest.EmergencyStatus status;
        private String reviewNotes;
        private LocalDateTime requestedAt;
        private LocalDateTime waitingPeriodEndsAt;
        private boolean waitingPeriodPassed;
        private LocalDateTime reviewedAt;
        private LocalDateTime accessStartsAt;
        private LocalDateTime accessExpiresAt;
        private boolean accessActive;
        private long remainingAccessMinutes;
        private List<EvidenceDto> evidences;
        private List<AccessibleDocumentDto> accessibleDocuments;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EvidenceDto {
        private Long id;
        private String originalFilename;
        private String mimeType;
        private Long fileSize;
        private LocalDateTime uploadedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AccessibleDocumentDto {
        private Long documentId;
        private String title;
        private String categoryName;
        private String originalFilename;
        private Long fileSize;
        private String mimeType;
    }
}
