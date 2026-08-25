package com.lifeledger.controller;

import com.lifeledger.dto.admin.AdminDashboardResponse;
import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.common.PagedResponse;
import com.lifeledger.dto.emergency.EmergencyRequestCreate;
import com.lifeledger.entity.ActivityLog;
import com.lifeledger.service.AdminService;
import com.lifeledger.service.AuditLogService;
import com.lifeledger.service.EmergencyAccessService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final EmergencyAccessService emergencyAccessService;
    private final AuditLogService auditLogService;

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<AdminDashboardResponse>> getDashboard() {
        AdminDashboardResponse response = adminService.getDashboardStats();
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<AdminDashboardResponse.UserAdminDto>>> getAllUsers() {
        List<AdminDashboardResponse.UserAdminDto> list = adminService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<Void>> toggleUserStatus(
            @PathVariable Long id,
            @RequestParam("active") boolean active,
            HttpServletRequest request) {
        adminService.toggleUserActiveStatus(id, active, request);
        return ResponseEntity.ok(ApiResponse.ok("User status updated successfully", null));
    }

    @GetMapping("/emergency-requests")
    public ResponseEntity<ApiResponse<List<EmergencyRequestCreate.EmergencyResponseDto>>> getAllEmergencyRequests() {
        List<EmergencyRequestCreate.EmergencyResponseDto> list = emergencyAccessService.getAllRequestsForAdmin();
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/audit-logs")
    public ResponseEntity<ApiResponse<PagedResponse<ActivityLog>>> getAllLogs(
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "30") int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<ActivityLog> logPage = auditLogService.getAllSystemLogs(pageable);

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
}
