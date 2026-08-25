package com.lifeledger.service;

import com.lifeledger.dto.auth.UserProfileResponse;
import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.User;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.repository.UserRepository;
import com.lifeledger.security.UserPrincipal;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public User getCurrentUser(UserPrincipal principal) {
        return userRepository.findById(principal.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Transactional(readOnly = true)
    public UserProfileResponse.ProfileDto getProfile(User user) {
        return UserProfileResponse.ProfileDto.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .role(user.getRole())
                .active(user.isActive())
                .twoFactorEnabled(user.isTwoFactorEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }

    @Transactional
    public UserProfileResponse.ProfileDto updateProfile(User user, UserProfileResponse.ProfileUpdateDto dto, HttpServletRequest request) {
        user.setFullName(dto.getFullName().trim());
        if (dto.getPhone() != null) {
            user.setPhone(dto.getPhone().trim());
        }
        if (dto.getTwoFactorEnabled() != null) {
            user.setTwoFactorEnabled(dto.getTwoFactorEnabled());
        }

        User updated = userRepository.save(user);
        auditLogService.logActivity(user, ActivityLog.ActivityAction.PROFILE_UPDATED, "PROFILE", "Updated user profile details", request);
        return getProfile(updated);
    }
}
