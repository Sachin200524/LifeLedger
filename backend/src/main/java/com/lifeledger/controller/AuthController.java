package com.lifeledger.controller;

import com.lifeledger.dto.auth.*;
import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.AuthService;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request,
                                                              HttpServletRequest httpRequest) {
        AuthResponse response = authService.register(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Registration successful", response));
    }

    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request,
                                                           HttpServletRequest httpRequest) {
        AuthResponse response = authService.login(request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Login successful", response));
    }

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse.ProfileDto>> getCurrentUser(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(user)));
    }

    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(@CurrentUser UserPrincipal principal,
                                                            @Valid @RequestBody PasswordChangeRequest request,
                                                            HttpServletRequest httpRequest) {
        User user = userService.getCurrentUser(principal);
        authService.changePassword(user, request, httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Password changed successfully", null));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<String>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest.ForgotRequest request,
                                                              HttpServletRequest httpRequest) {
        String token = authService.initiateForgotPassword(request.getEmail(), httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Password reset instructions initiated", token));
    }

    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ForgotPasswordRequest.ResetRequest request,
                                                           HttpServletRequest httpRequest) {
        authService.resetPassword(request.getToken(), request.getNewPassword(), request.getConfirmNewPassword(), httpRequest);
        return ResponseEntity.ok(ApiResponse.ok("Password has been successfully reset", null));
    }
}
