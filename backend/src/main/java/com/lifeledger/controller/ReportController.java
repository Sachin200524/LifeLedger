package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.report.ReportStatsResponse;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.ReportService;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;
    private final UserService userService;

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<ReportStatsResponse>> getStats(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        ReportStatsResponse stats = reportService.getStatsForUser(user);
        return ResponseEntity.ok(ApiResponse.ok(stats));
    }

    @GetMapping("/export/pdf")
    public ResponseEntity<Resource> exportPdfReport(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        byte[] pdfBytes = reportService.generatePdfReport(user);

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"LifeLedger_Vault_Report_" + System.currentTimeMillis() + ".pdf\"")
                .body(new ByteArrayResource(pdfBytes));
    }
}
