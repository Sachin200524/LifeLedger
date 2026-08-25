package com.lifeledger;

import com.lifeledger.exception.SecurityViolationException;
import com.lifeledger.service.EncryptionService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import java.nio.charset.StandardCharsets;
import java.util.Arrays;

import static org.junit.jupiter.api.Assertions.*;

public class EncryptionServiceTest {

    private EncryptionService encryptionService;

    @BeforeEach
    public void setUp() {
        encryptionService = new EncryptionService();
        ReflectionTestUtils.setField(encryptionService, "masterKeyString", "TestAes256SecretKeyForUnitTesting2026!");
        encryptionService.init();
    }

    @Test
    public void testEncryptAndDecryptSuccess() {
        String originalText = "Confidential Legacy Document: Bank Account #9876543210 - Pin: 9988";
        byte[] plaintextBytes = originalText.getBytes(StandardCharsets.UTF_8);

        byte[] encryptedBytes = encryptionService.encrypt(plaintextBytes);
        assertNotNull(encryptedBytes);
        assertTrue(encryptedBytes.length > plaintextBytes.length, "Encrypted payload should include 12-byte IV and 16-byte auth tag");
        assertFalse(Arrays.equals(plaintextBytes, encryptedBytes), "Encrypted bytes must not match plaintext");

        byte[] decryptedBytes = encryptionService.decrypt(encryptedBytes);
        String decryptedText = new String(decryptedBytes, StandardCharsets.UTF_8);

        assertEquals(originalText, decryptedText);
    }

    @Test
    public void testDifferentIVsProduceDifferentCiphertexts() {
        byte[] data = "Identical message".getBytes(StandardCharsets.UTF_8);
        byte[] enc1 = encryptionService.encrypt(data);
        byte[] enc2 = encryptionService.encrypt(data);

        assertFalse(Arrays.equals(enc1, enc2), "Two encryptions of identical plaintext must yield distinct ciphertexts due to random IV");
    }

    @Test
    public void testTamperedCiphertextRejection() {
        byte[] data = "Tamper test".getBytes(StandardCharsets.UTF_8);
        byte[] encrypted = encryptionService.encrypt(data);

        // Tamper with one byte in the ciphertext payload
        encrypted[encrypted.length - 1] ^= 0xFF;

        assertThrows(SecurityViolationException.class, () -> {
            encryptionService.decrypt(encrypted);
        }, "Tampered ciphertext must fail GCM tag authentication");
    }
}
