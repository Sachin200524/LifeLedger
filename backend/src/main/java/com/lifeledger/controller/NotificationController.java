package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.entity.Notification;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.NotificationService;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<Notification>>> getNotifications(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<Notification> list = notificationService.getUserNotifications(user);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        long count = notificationService.getUnreadCount(user);
        return ResponseEntity.ok(ApiResponse.ok(count));
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<ApiResponse<Void>> markAsRead(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        notificationService.markAsRead(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Notification marked as read", null));
    }

    @PatchMapping("/read-all")
    public ResponseEntity<ApiResponse<Void>> markAllAsRead(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        notificationService.markAllAsRead(user);
        return ResponseEntity.ok(ApiResponse.ok("All notifications marked as read", null));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNotification(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        notificationService.deleteNotification(id, user);
        return ResponseEntity.ok(ApiResponse.ok("Notification removed", null));
    }

    @DeleteMapping("/clear-all")
    public ResponseEntity<ApiResponse<Void>> clearAll(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        notificationService.clearAll(user);
        return ResponseEntity.ok(ApiResponse.ok("All notifications cleared", null));
    }
}
