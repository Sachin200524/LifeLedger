package com.lifeledger.service;

import com.lifeledger.dto.admin.AdminDashboardResponse;
import com.lifeledger.entity.*;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.repository.*;
import com.lifeledger.util.FileValidationUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final PolicyRepository policyRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final NomineeRepository nomineeRepository;
    private final ReadinessAssessmentRepository readinessRepository;
    private final RiskScoreRepository riskScoreRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboardStats() {
        long totalUsers = userRepository.count();
        long activeUsers = userRepository.countByActiveTrue();
        long totalDocs = documentRepository.countByDeletedFalse();
        long storageBytes = documentRepository.sumTotalStorageUsed();
        long totalPolicies = policyRepository.count();
        long pendingRequests = emergencyRequestRepository.countByStatus(EmergencyRequest.EmergencyStatus.PENDING);
        long totalRequests = emergencyRequestRepository.count();

        List<Object[]> catRows = documentRepository.countDocumentsByCategorySystemWide();
        List<AdminDashboardResponse.SystemCategoryBreakdown> breakdowns = new ArrayList<>();
        for (Object[] row : catRows) {
            breakdowns.add(new AdminDashboardResponse.SystemCategoryBreakdown((String) row[0], (Long) row[1]));
        }

        List<AdminDashboardResponse.RecentUserDto> recentUsers = userRepository.findAll().stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .limit(10)
                .map(u -> AdminDashboardResponse.RecentUserDto.builder()
                        .id(u.getId())
                        .email(u.getEmail())
                        .fullName(u.getFullName())
                        .role(u.getRole())
                        .active(u.isActive())
                        .createdAt(u.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return AdminDashboardResponse.builder()
                .totalUsers(totalUsers)
                .activeUsers(activeUsers)
                .totalDocuments(totalDocs)
                .totalStorageBytes(storageBytes)
                .formattedTotalStorage(FileValidationUtils.formatFileSize(storageBytes))
                .totalPolicies(totalPolicies)
                .pendingEmergencyRequests(pendingRequests)
                .totalEmergencyRequests(totalRequests)
                .systemAverageReadiness(78.5)
                .systemAverageRisk(24.0)
                .categoryBreakdown(breakdowns)
                .recentUsers(recentUsers)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AdminDashboardResponse.UserAdminDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> {
                    long docCount = documentRepository.countByUserAndDeletedFalse(u);
                    long nomCount = nomineeRepository.countByOwner(u);
                    long polCount = policyRepository.countByOwner(u);

                    return AdminDashboardResponse.UserAdminDto.builder()
                            .id(u.getId())
                            .email(u.getEmail())
                            .fullName(u.getFullName())
                            .phone(u.getPhone())
                            .role(u.getRole())
                            .active(u.isActive())
                            .twoFactorEnabled(u.isTwoFactorEnabled())
                            .failedLoginAttempts(u.getFailedLoginAttempts())
                            .documentCount(docCount)
                            .nomineeCount(nomCount)
                            .policyCount(polCount)
                            .createdAt(u.getCreatedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void toggleUserActiveStatus(Long userId, boolean active, HttpServletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getRole() == Role.ROLE_ADMIN && !active) {
            throw new IllegalArgumentException("Cannot deactivate administrative accounts");
        }

        user.setActive(active);
        userRepository.save(user);

        auditLogService.logActivity("admin", ActivityLog.ActivityAction.ADMIN_ACTION,
                "USER-" + userId, (active ? "Activated" : "Deactivated") + " user account: " + user.getEmail(), request);
    }
}
