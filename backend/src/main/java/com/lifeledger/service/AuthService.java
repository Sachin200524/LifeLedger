package com.lifeledger.service;

import com.lifeledger.dto.auth.AuthResponse;
import com.lifeledger.dto.auth.LoginRequest;
import com.lifeledger.dto.auth.PasswordChangeRequest;
import com.lifeledger.dto.auth.RegisterRequest;
import com.lifeledger.entity.ActivityLog;
import com.lifeledger.entity.Nominee;
import com.lifeledger.entity.Role;
import com.lifeledger.entity.User;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.exception.SecurityViolationException;
import com.lifeledger.exception.UnauthorizedException;
import com.lifeledger.repository.NomineeRepository;
import com.lifeledger.repository.UserRepository;
import com.lifeledger.security.JwtTokenProvider;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final NomineeRepository nomineeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final AuditLogService auditLogService;

    @Transactional
    public AuthResponse register(RegisterRequest request, HttpServletRequest httpRequest) {
        if (!request.getPassword().equals(request.getConfirmPassword())) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        if (userRepository.existsByEmail(request.getEmail().toLowerCase().trim())) {
            throw new IllegalArgumentException("An account with this email already exists");
        }

        User user = User.builder()
                .fullName(request.getFullName().trim())
                .email(request.getEmail().toLowerCase().trim())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .role(Role.ROLE_USER)
                .active(true)
                .failedLoginAttempts(0)
                .build();

        user = userRepository.save(user);

        // Link with any pending nominees created with this email
        List<Nominee> nominees = nomineeRepository.findByEmail(user.getEmail());
        for (Nominee n : nominees) {
            n.setNomineeUser(user);
            nomineeRepository.save(n);
        }

        auditLogService.logActivity(user, ActivityLog.ActivityAction.REGISTER, "AUTH", "User registered successfully", httpRequest);

        String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }

    @Transactional
    public AuthResponse login(LoginRequest request, HttpServletRequest httpRequest) {
        String email = request.getEmail().toLowerCase().trim();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    auditLogService.logActivity(email, ActivityLog.ActivityAction.FAILED_LOGIN, "AUTH", "Login attempt for non-existent email", httpRequest);
                    return new BadCredentialsException("Invalid email or password");
                });

        if (!user.isActive()) {
            auditLogService.logActivity(user, ActivityLog.ActivityAction.FAILED_LOGIN, "AUTH", "Login attempt on deactivated account", httpRequest);
            throw new SecurityViolationException("Your account has been deactivated. Please contact support.");
        }

        if (user.getLockUntil() != null && user.getLockUntil().isAfter(LocalDateTime.now())) {
            auditLogService.logActivity(user, ActivityLog.ActivityAction.FAILED_LOGIN, "AUTH", "Login attempt on locked account", httpRequest);
            throw new SecurityViolationException("Account is temporarily locked due to multiple failed login attempts. Please try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setLockUntil(LocalDateTime.now().plusMinutes(15));
                log.warn("Account {} locked for 15 minutes due to 5 consecutive failed attempts", user.getEmail());
            }
            userRepository.save(user);
            auditLogService.logActivity(user, ActivityLog.ActivityAction.FAILED_LOGIN, "AUTH", "Invalid password (attempt " + attempts + ")", httpRequest);
            throw new BadCredentialsException("Invalid email or password");
        }

        // Reset failed login attempts on successful login
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.LOGIN, "AUTH", "User logged in successfully", httpRequest);

        String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail(), user.getId(), user.getRole().name());

        return AuthResponse.builder()
                .token(token)
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole())
                .phone(user.getPhone())
                .build();
    }

    @Transactional
    public void changePassword(User user, PasswordChangeRequest request, HttpServletRequest httpRequest) {
        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new BadCredentialsException("Current password is incorrect");
        }

        if (!request.getNewPassword().equals(request.getConfirmNewPassword())) {
            throw new IllegalArgumentException("New passwords do not match");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new IllegalArgumentException("New password cannot be identical to the current password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.PASSWORD_CHANGED, "AUTH", "User updated password", httpRequest);
    }

    @Transactional
    public String initiateForgotPassword(String email, HttpServletRequest httpRequest) {
        User user = userRepository.findByEmail(email.toLowerCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("No account found with provided email address"));

        String resetToken = UUID.randomUUID().toString().replace("-", "");
        user.setResetPasswordToken(resetToken);
        user.setResetPasswordExpiresAt(LocalDateTime.now().plusHours(1));
        userRepository.save(user);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.PASSWORD_CHANGED, "AUTH", "Initiated password reset request", httpRequest);

        return resetToken;
    }

    @Transactional
    public void resetPassword(String token, String newPassword, String confirmPassword, HttpServletRequest httpRequest) {
        if (!newPassword.equals(confirmPassword)) {
            throw new IllegalArgumentException("Passwords do not match");
        }

        User user = userRepository.findByResetPasswordToken(token)
                .orElseThrow(() -> new IllegalArgumentException("Invalid or expired password reset token"));

        if (user.getResetPasswordExpiresAt() == null || user.getResetPasswordExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Password reset token has expired. Please request a new one.");
        }

        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetPasswordToken(null);
        user.setResetPasswordExpiresAt(null);
        user.setFailedLoginAttempts(0);
        user.setLockUntil(null);
        userRepository.save(user);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.PASSWORD_CHANGED, "AUTH", "Password successfully reset via token", httpRequest);
    }
}
