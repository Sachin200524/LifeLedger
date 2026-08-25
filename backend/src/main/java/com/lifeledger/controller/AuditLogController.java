package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.common.PagedResponse;
import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.AuditLogService;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/activity-logs")
@RequiredArgsConstructor
public class AuditLogController {

    private final AuditLogService auditLogService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ActivityLog>>> getMyLogs(
            @CurrentUser UserPrincipal principal,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "20") int size) {
        User user = userService.getCurrentUser(principal);
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logPage = auditLogService.getUserLogs(user, pageable);

        PagedResponse<ActivityLog> paged = PagedResponse.<ActivityLog>builder()
                .content(logPage.getContent())
                .pageNumber(logPage.getNumber())
                .pageSize(logPage.getSize())
                .totalElements(logPage.getTotalElements())
                .totalPages(logPage.getTotalPages())
                .last(logPage.isLast())
                .build();

        return ResponseEntity.ok(ApiResponse.ok(paged));
    }

    @GetMapping("/recent")
    public ResponseEntity<ApiResponse<List<ActivityLog>>> getRecentLogs(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<ActivityLog> recent = auditLogService.getRecentUserLogs(user);
        return ResponseEntity.ok(ApiResponse.ok(recent));
    }
}
