package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.emergency.EmergencyRequestCreate;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.EmergencyAccessService;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/emergency-requests")
@RequiredArgsConstructor
public class EmergencyRequestController {

    private final EmergencyAccessService emergencyAccessService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<EmergencyRequestCreate.EmergencyResponseDto>> submitRequest(
            @CurrentUser UserPrincipal principal,
            @RequestParam("policyId") Long policyId,
            @RequestParam("reason") String reason,
            @RequestParam(value = "evidence", required = false) MultipartFile evidenceFile,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        EmergencyRequestCreate.EmergencyResponseDto response = emergencyAccessService.submitRequest(user, policyId, reason, evidenceFile, request);
        return ResponseEntity.ok(ApiResponse.ok("Emergency access request submitted. Vault owner notified.", response));
    }

    @GetMapping("/owner")
    public ResponseEntity<ApiResponse<List<EmergencyRequestCreate.EmergencyResponseDto>>> getRequestsForOwner(
            @CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<EmergencyRequestCreate.EmergencyResponseDto> list = emergencyAccessService.getRequestsForOwner(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/nominee")
    public ResponseEntity<ApiResponse<List<EmergencyRequestCreate.EmergencyResponseDto>>> getRequestsForNominee(
            @CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<EmergencyRequestCreate.EmergencyResponseDto> list = emergencyAccessService.getRequestsForNomineeUser(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @PutMapping("/{id}/review")
    public ResponseEntity<ApiResponse<EmergencyRequestCreate.EmergencyResponseDto>> reviewRequest(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody EmergencyRequestCreate.ReviewEmergencyDto dto,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        EmergencyRequestCreate.EmergencyResponseDto response = emergencyAccessService.reviewRequest(user, id, dto, request);
        String msg = Boolean.TRUE.equals(dto.getApprove()) ? "Emergency access approved" : "Emergency access rejected";
        return ResponseEntity.ok(ApiResponse.ok(msg, response));
    }

    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<Void>> cancelRequest(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        emergencyAccessService.cancelRequest(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Emergency request cancelled successfully", null));
    }

    @GetMapping("/{id}/accessible-documents")
    public ResponseEntity<ApiResponse<List<EmergencyRequestCreate.AccessibleDocumentDto>>> getAccessibleDocuments(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        List<EmergencyRequestCreate.AccessibleDocumentDto> list = emergencyAccessService.getAccessibleDocuments(user, id);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
