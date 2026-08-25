package com.lifeledger.dto.nominee;

import com.lifeledger.entity.Nominee;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

public class NomineeRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateNomineeDto {
        @NotBlank(message = "Nominee name is required")
        private String name;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email format")
        private String email;

        private String phone;

        @NotNull(message = "Relationship is required")
        private Nominee.Relationship relationship;

        private String notes;
        private List<Long> documentIds;
        private List<Long> categoryIds;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UpdateNomineeDto {
        @NotBlank(message = "Nominee name is required")
        private String name;
        private String phone;
        @NotNull(message = "Relationship is required")
        private Nominee.Relationship relationship;
        private String notes;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NomineeDto {
        private Long id;
        private String name;
        private String email;
        private String phone;
        private Nominee.Relationship relationship;
        private Nominee.VerificationStatus verificationStatus;
        private String invitationToken;
        private LocalDateTime invitationExpiresAt;
        private LocalDateTime verifiedAt;
        private String notes;
        private long assignedPolicyCount;
        private long assignedDocumentCount;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }
}
