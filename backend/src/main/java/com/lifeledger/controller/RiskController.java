package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.score.RiskScoreResponse;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.RiskScoringService;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/risk")
@RequiredArgsConstructor
public class RiskController {

    private final RiskScoringService riskScoringService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<RiskScoreResponse>> getRisk(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        RiskScoreResponse response = riskScoringService.calculateAndSaveRisk(user);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }
}
