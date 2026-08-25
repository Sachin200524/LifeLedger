package com.lifeledger.controller;

import com.lifeledger.dto.auth.UserProfileResponse;
import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse.ProfileDto>> getMyProfile(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        return ResponseEntity.ok(ApiResponse.ok(userService.getProfile(user)));
    }

    @PutMapping("/me")
    public ResponseEntity<ApiResponse<UserProfileResponse.ProfileDto>> updateProfile(@CurrentUser UserPrincipal principal,
                                                                                    @Valid @RequestBody UserProfileResponse.ProfileUpdateDto dto,
                                                                                    HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        UserProfileResponse.ProfileDto updated = userService.updateProfile(user, dto, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }
}
