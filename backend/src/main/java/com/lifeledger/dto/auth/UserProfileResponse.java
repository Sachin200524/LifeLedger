package com.lifeledger.dto.auth;

import com.lifeledger.entity.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class UserProfileResponse {

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileDto {
        private Long id;
        private String email;
        private String fullName;
        private String phone;
        private Role role;
        private boolean active;
        private boolean twoFactorEnabled;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProfileUpdateDto {
        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 100)
        private String fullName;

        private String phone;
        private Boolean twoFactorEnabled;
    }
}
