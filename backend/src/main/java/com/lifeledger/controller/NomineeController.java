package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.nominee.NomineeRequest;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.NomineeService;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/nominees")
@RequiredArgsConstructor
public class NomineeController {

    private final NomineeService nomineeService;
    private final UserService userService;

    @PostMapping
    public ResponseEntity<ApiResponse<NomineeRequest.NomineeDto>> addNominee(
            @CurrentUser UserPrincipal principal,
            @Valid @RequestBody NomineeRequest.CreateNomineeDto dto,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        NomineeRequest.NomineeDto response = nomineeService.addNominee(user, dto, request);
        return ResponseEntity.ok(ApiResponse.ok("Nominee added successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<NomineeRequest.NomineeDto>>> getMyNominees(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<NomineeRequest.NomineeDto> list = nomineeService.getOwnerNominees(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NomineeRequest.NomineeDto>> getNomineeById(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        NomineeRequest.NomineeDto response = nomineeService.getNomineeById(user, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<NomineeRequest.NomineeDto>> updateNominee(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody NomineeRequest.UpdateNomineeDto dto,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        NomineeRequest.NomineeDto response = nomineeService.updateNominee(user, id, dto, request);
        return ResponseEntity.ok(ApiResponse.ok("Nominee updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNominee(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        nomineeService.deleteNominee(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Nominee removed successfully", null));
    }

    @PostMapping("/{id}/resend-invite")
    public ResponseEntity<ApiResponse<String>> resendInvitation(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        String token = nomineeService.resendInvitation(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Invitation token regenerated successfully", token));
    }

    @PostMapping("/invite/accept")
    public ResponseEntity<ApiResponse<NomineeRequest.NomineeDto>> acceptInvitation(
            @RequestParam("token") String token,
            @CurrentUser UserPrincipal principal,
            HttpServletRequest request) {
        User user = principal != null ? userService.getCurrentUser(principal) : null;
        NomineeRequest.NomineeDto response = nomineeService.acceptInvitation(token, user, request);
        return ResponseEntity.ok(ApiResponse.ok("Nominee invitation verified and activated", response));
    }

    @GetMapping("/me/designations")
    public ResponseEntity<ApiResponse<List<NomineeRequest.NomineeDto>>> getMyDesignations(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<NomineeRequest.NomineeDto> list = nomineeService.getDesignationsForUser(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }
}
