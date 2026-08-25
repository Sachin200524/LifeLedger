package com.lifeledger.dto.policy;

import com.lifeledger.entity.Policy;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class PolicyRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreatePolicyDto {
        @NotBlank(message = "Policy name is required")
        private String name;

        private String description;

        @NotNull(message = "Nominee ID is required")
        private Long nomineeId;

        @NotNull(message = "Waiting period in hours is required")
        @Min(value = 0, message = "Waiting period cannot be negative")
        private Integer waitingPeriodHours;

        @NotNull(message = "Approval type is required")
        private Policy.ApprovalType approvalType;

        @NotNull(message = "Access duration in hours is required")
        @Min(value = 1, message = "Access duration must be at least 1 hour")
        private Integer accessDurationHours;

        private LocalDate policyExpiryDate;

        @NotEmpty(message = "At least one document must be selected")
        private List<Long> documentIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdatePolicyDto {
        @NotBlank(message = "Policy name is required")
        private String name;
        private String description;
        private Integer waitingPeriodHours;
        private Policy.ApprovalType approvalType;
        private Integer accessDurationHours;
        private LocalDate policyExpiryDate;
        private Boolean active;
        private List<Long> documentIds;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyDto {
        private Long id;
        private String name;
        private String description;
        private Long nomineeId;
        private String nomineeName;
        private String nomineeEmail;
        private Integer waitingPeriodHours;
        private Policy.ApprovalType approvalType;
        private Integer accessDurationHours;
        private LocalDate policyExpiryDate;
        private boolean active;
        private List<PolicyDocumentDto> documents;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PolicyDocumentDto {
        private Long documentId;
        private String title;
        private String categoryName;
        private String originalFilename;
        private Long fileSize;
    }
}
