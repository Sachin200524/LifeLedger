package com.lifeledger.util;

import com.lifeledger.exception.StorageException;
import org.springframework.web.multipart.MultipartFile;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.HexFormat;
import java.util.Set;

public class FileValidationUtils {

    private static final long MAX_FILE_SIZE = 52428800; // 50 MB

    private static final Set<String> ALLOWED_MIME_TYPES = Set.of(
            "application/pdf",
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "text/plain"
    );

    public static void validateFile(MultipartFile file, String detectedMimeType) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File cannot be null or empty");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("File size exceeds 50 MB limit");
        }

        if (detectedMimeType != null && !ALLOWED_MIME_TYPES.contains(detectedMimeType.toLowerCase())) {
            // Allow general octet-stream only if filename ends with supported ext
            String filename = file.getOriginalFilename();
            if (filename == null || (!filename.toLowerCase().endsWith(".pdf") &&
                    !filename.toLowerCase().endsWith(".jpg") &&
                    !filename.toLowerCase().endsWith(".jpeg") &&
                    !filename.toLowerCase().endsWith(".png") &&
                    !filename.toLowerCase().endsWith(".doc") &&
                    !filename.toLowerCase().endsWith(".docx") &&
                    !filename.toLowerCase().endsWith(".txt"))) {
                throw new IllegalArgumentException("Unsupported file type: " + detectedMimeType + ". Allowed: PDF, JPG, PNG, DOC, DOCX, TXT");
            }
        }
    }

    public static String sanitizeFilename(String filename) {
        if (filename == null || filename.trim().isEmpty()) {
            return "document_" + System.currentTimeMillis();
        }
        // Extract pure filename component if a path was passed
        String baseName = filename.replace("\\", "/");
        if (baseName.contains("/")) {
            baseName = baseName.substring(baseName.lastIndexOf("/") + 1);
        }
        baseName = baseName.replace("..", "");
        String cleanName = baseName.replaceAll("[^a-zA-Z0-9.\\-_ ]", "_").trim();
        if (cleanName.isEmpty() || cleanName.equals(".") || cleanName.equals("..")) {
            return "document_" + System.currentTimeMillis();
        }
        return cleanName;
    }

    public static String calculateSha256(byte[] data) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(data);
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException e) {
            throw new StorageException("SHA-256 algorithm not available", e);
        }
    }

    public static String formatFileSize(long bytes) {
        if (bytes < 1024) return bytes + " B";
        int exp = (int) (Math.log(bytes) / Math.log(1024));
        char pre = "KMGTPE".charAt(exp - 1);
        return String.format("%.1f %sB", bytes / Math.pow(1024, exp), pre);
    }
}
