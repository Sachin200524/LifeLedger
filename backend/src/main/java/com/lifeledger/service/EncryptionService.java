package com.lifeledger.service;

import com.lifeledger.exception.SecurityViolationException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Arrays;

@Slf4j
@Service
public class EncryptionService {

    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int GCM_IV_LENGTH = 12; // 96-bit IV
    private static final int GCM_TAG_LENGTH = 128; // 128-bit authentication tag

    @Value("${app.encryption.master-key}")
    private String masterKeyString;

    private SecretKey secretKey;
    private final SecureRandom secureRandom = new SecureRandom();

    @PostConstruct
    public void init() {
        try {
            MessageDigest sha256 = MessageDigest.getInstance("SHA-256");
            byte[] keyBytes = sha256.digest(masterKeyString.getBytes(StandardCharsets.UTF_8));
            this.secretKey = new SecretKeySpec(keyBytes, "AES");
            log.info("AES-256-GCM Encryption engine initialized successfully");
        } catch (Exception e) {
            throw new IllegalStateException("Failed to initialize AES-256 encryption key", e);
        }
    }

    /**
     * Encrypts plaintext bytes using AES-256-GCM.
     * Prepends the 12-byte initialization vector (IV) to the output stream.
     */
    public byte[] encrypt(byte[] plaintext) {
        try {
            byte[] iv = new byte[GCM_IV_LENGTH];
            secureRandom.nextBytes(iv);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.ENCRYPT_MODE, secretKey, parameterSpec);

            byte[] cipherText = cipher.doFinal(plaintext);

            // Output format: [12-byte IV][Ciphertext + Auth Tag]
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            outputStream.write(iv);
            outputStream.write(cipherText);

            return outputStream.toByteArray();
        } catch (Exception e) {
            log.error("AES-256-GCM encryption failed: {}", e.getMessage());
            throw new SecurityViolationException("Encryption failed: " + e.getMessage());
        }
    }

    /**
     * Decrypts AES-256-GCM ciphertext bytes.
     * Extracts the leading 12-byte IV and validates authentication tag.
     */
    public byte[] decrypt(byte[] encryptedPayload) {
        try {
            if (encryptedPayload.length < GCM_IV_LENGTH) {
                throw new SecurityViolationException("Corrupted encrypted payload: invalid size");
            }

            byte[] iv = Arrays.copyOfRange(encryptedPayload, 0, GCM_IV_LENGTH);
            byte[] cipherText = Arrays.copyOfRange(encryptedPayload, GCM_IV_LENGTH, encryptedPayload.length);

            Cipher cipher = Cipher.getInstance(ALGORITHM);
            GCMParameterSpec parameterSpec = new GCMParameterSpec(GCM_TAG_LENGTH, iv);
            cipher.init(Cipher.DECRYPT_MODE, secretKey, parameterSpec);

            return cipher.doFinal(cipherText);
        } catch (Exception e) {
            log.error("AES-256-GCM decryption failed or authentication tag mismatch: {}", e.getMessage());
            throw new SecurityViolationException("Decryption failed or payload tampered: " + e.getMessage());
        }
    }

    public InputStream decryptToStream(byte[] encryptedPayload) {
        byte[] decryptedBytes = decrypt(encryptedPayload);
        return new ByteArrayInputStream(decryptedBytes);
    }
}
