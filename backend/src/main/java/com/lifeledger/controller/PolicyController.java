package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.policy.PolicyRequest;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.PolicyService;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/policies")
@RequiredArgsConstructor
public class PolicyController {

    private final PolicyService policyService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<PolicyRequest.PolicyDto>> createPolicy(
            @CurrentUser UserPrincipal principal,
            @Valid @RequestBody PolicyRequest.CreatePolicyDto dto,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        PolicyRequest.PolicyDto response = policyService.createPolicy(user, dto, request);
        return ResponseEntity.ok(ApiResponse.ok("Emergency policy created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<PolicyRequest.PolicyDto>>> getMyPolicies(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<PolicyRequest.PolicyDto> list = policyService.getOwnerPolicies(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyRequest.PolicyDto>> getPolicyById(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        PolicyRequest.PolicyDto response = policyService.getPolicyById(user, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PolicyRequest.PolicyDto>> updatePolicy(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody PolicyRequest.UpdatePolicyDto dto,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        PolicyRequest.PolicyDto response = policyService.updatePolicy(user, id, dto, request);
        return ResponseEntity.ok(ApiResponse.ok("Policy updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deletePolicy(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        policyService.deletePolicy(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Policy deleted successfully", null));
    }

    @PatchMapping("/{id}/toggle-active")
    public ResponseEntity<ApiResponse<PolicyRequest.PolicyDto>> toggleActive(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        PolicyRequest.PolicyDto response = policyService.togglePolicyActive(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Policy status toggled", response));
    }

    @GetMapping("/nominee/available")
    public ResponseEntity<ApiResponse<List<PolicyRequest.PolicyDto>>> getAvailableForNominee(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<PolicyRequest.PolicyDto> list = policyService.getAvailablePoliciesForNomineeUser(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
