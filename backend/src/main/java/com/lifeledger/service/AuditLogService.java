package com.lifeledger.service;

import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.User;
import com.lifeledger.repository.ActivityLogRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final ActivityLogRepository activityLogRepository;

    @Transactional
    public void logActivity(User user, ActivityLog.ActivityAction action, String targetResource, String details, HttpServletRequest request) {
        try {
            String ip = extractClientIp(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";

            ActivityLog entry = ActivityLog.builder()
                    .user(user)
                    .userEmail(user != null ? user.getEmail() : "anonymous")
                    .action(action)
                    .ipAddress(ip)
                    .userAgent(userAgent != null && userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent)
                    .targetResource(targetResource)
                    .details(details)
                    .build();

            activityLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to persist audit log entry: {}", e.getMessage());
        }
    }

    @Transactional
    public void logActivity(String email, ActivityLog.ActivityAction action, String targetResource, String details, HttpServletRequest request) {
        try {
            String ip = extractClientIp(request);
            String userAgent = request != null ? request.getHeader("User-Agent") : "Unknown";

            ActivityLog entry = ActivityLog.builder()
                    .userEmail(email)
                    .action(action)
                    .ipAddress(ip)
                    .userAgent(userAgent != null && userAgent.length() > 250 ? userAgent.substring(0, 250) : userAgent)
                    .targetResource(targetResource)
                    .details(details)
                    .build();

            activityLogRepository.save(entry);
        } catch (Exception e) {
            log.error("Failed to persist audit log entry: {}", e.getMessage());
        }
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getUserLogs(User user, Pageable pageable) {
        return activityLogRepository.findByUserOrderByCreatedAtDesc(user, pageable);
    }

    @Transactional(readOnly = true)
    public List<ActivityLog> getRecentUserLogs(User user) {
        return activityLogRepository.findTop20ByUserOrderByCreatedAtDesc(user);
    }

    @Transactional(readOnly = true)
    public Page<ActivityLog> getAllSystemLogs(Pageable pageable) {
        return activityLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    private String extractClientIp(HttpServletRequest request) {
        if (request == null) return "127.0.0.1";
        String ip = request.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getHeader("Proxy-Client-IP");
        }
        if (ip == null || ip.isEmpty() || "unknown".equalsIgnoreCase(ip)) {
            ip = request.getRemoteAddr();
        }
        if (ip != null && ip.contains(",")) {
            ip = ip.split(",")[0].trim();
        }
        return ip != null ? ip : "127.0.0.1";
    }
}
