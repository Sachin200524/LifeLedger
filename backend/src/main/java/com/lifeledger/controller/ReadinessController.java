package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.score.ReadinessScoreResponse;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.ReadinessScoringService;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/readiness")
@RequiredArgsConstructor
public class ReadinessController {

    private final ReadinessScoringService readinessScoringService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<ReadinessScoreResponse>> getReadiness(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        ReadinessScoreResponse response = readinessScoringService.calculateAndSaveReadiness(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
