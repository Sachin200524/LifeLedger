package com.lifeledger;

import com.lifeledger.dto.auth.RegisterRequest;
import com.lifeledger.security.JwtTokenProvider;
import com.lifeledger.util.FileValidationUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;

import static org.junit.jupiter.api.Assertions.*;

public class AuthAndWorkflowTest {

    private PasswordEncoder passwordEncoder;
    private JwtTokenProvider jwtTokenProvider;

    @BeforeEach
    public void setUp() {
        passwordEncoder = new BCryptPasswordEncoder();
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtSecret", "4c8b9d3f1a2e7c5b6a9d0f3e2b1c4a5d8e7f9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9");
        ReflectionTestUtils.setField(jwtTokenProvider, "jwtExpirationMs", 3600000L);
        jwtTokenProvider.init();
    }

    @Test
    public void testBCryptPasswordHashing() {
        String rawPassword = "SecurePassword@2026!";
        String hash = passwordEncoder.encode(rawPassword);

        assertNotNull(hash);
        assertNotEquals(rawPassword, hash);
        assertTrue(passwordEncoder.matches(rawPassword, hash));
        assertFalse(passwordEncoder.matches("WrongPassword@123", hash));
    }

    @Test
    public void testJwtGenerationAndValidation() {
        String email = "testuser@lifeledger.com";
        Long userId = 42L;
        String role = "ROLE_USER";

        String token = jwtTokenProvider.generateTokenFromUsername(email, userId, role);
        assertNotNull(token);
        assertTrue(jwtTokenProvider.validateToken(token));
        assertEquals(email, jwtTokenProvider.getEmailFromToken(token));
        assertEquals(userId, jwtTokenProvider.getUserIdFromToken(token));
    }

    @Test
    public void testFileChecksumAndSanitization() {
        String filenameWithTraversal = "../../etc/passwd/my report (1).pdf";
        String clean = FileValidationUtils.sanitizeFilename(filenameWithTraversal);
        assertFalse(clean.contains("/"));
        assertFalse(clean.contains(".."));

        byte[] sampleBytes = "Hello LifeLedger Vault".getBytes(StandardCharsets.UTF_8);
        String sha256 = FileValidationUtils.calculateSha256(sampleBytes);
        assertNotNull(sha256);
        assertEquals(64, sha256.length(), "SHA-256 hex string should be 64 characters");
    }
}
