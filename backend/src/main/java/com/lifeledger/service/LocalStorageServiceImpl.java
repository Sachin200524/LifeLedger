package com.lifeledger.service;

import com.lifeledger.exception.StorageException;
import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.UUID;

@Slf4j
@Service
public class LocalStorageServiceImpl implements StorageService {

    @Value("${app.storage.vault-dir:./storage/vault}")
    private String vaultDirString;

    @Value("${app.storage.evidence-dir:./storage/evidence}")
    private String evidenceDirString;

    private Path vaultPath;
    private Path evidencePath;

    @PostConstruct
    public void init() {
        try {
            this.vaultPath = Paths.get(vaultDirString).toAbsolutePath().normalize();
            this.evidencePath = Paths.get(evidenceDirString).toAbsolutePath().normalize();

            Files.createDirectories(this.vaultPath);
            Files.createDirectories(this.evidencePath);
            log.info("Local storage directories initialized: Vault={}, Evidence={}", vaultPath, evidencePath);
        } catch (IOException e) {
            throw new StorageException("Could not initialize local storage folders", e);
        }
    }

    @Override
    public String storeVaultFile(byte[] encryptedBytes, String originalFilename) {
        return storeFileInDir(encryptedBytes, originalFilename, vaultPath, "vault");
    }

    @Override
    public String storeEvidenceFile(byte[] encryptedBytes, String originalFilename) {
        return storeFileInDir(encryptedBytes, originalFilename, evidencePath, "evidence");
    }

    private String storeFileInDir(byte[] bytes, String originalFilename, Path targetDir, String subDirName) {
        try {
            String sanitizedExt = getSanitizedExtension(originalFilename);
            String uniqueFilename = UUID.randomUUID().toString() + (sanitizedExt.isEmpty() ? ".enc" : sanitizedExt + ".enc");
            Path targetFile = targetDir.resolve(uniqueFilename);

            Files.write(targetFile, bytes, StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
            log.debug("Stored encrypted file at: {}", targetFile);

            // Relative path for database reference
            return subDirName + "/" + uniqueFilename;
        } catch (IOException e) {
            throw new StorageException("Failed to store encrypted file", e);
        }
    }

    @Override
    public byte[] loadFile(String storagePath) {
        try {
            Path fullPath = resolveFullPath(storagePath);
            if (!Files.exists(fullPath)) {
                throw new StorageException("File not found at path: " + storagePath);
            }
            return Files.readAllBytes(fullPath);
        } catch (IOException e) {
            throw new StorageException("Failed to read file from storage", e);
        }
    }

    @Override
    public void deleteFile(String storagePath) {
        try {
            Path fullPath = resolveFullPath(storagePath);
            Files.deleteIfExists(fullPath);
            log.debug("Deleted file at: {}", fullPath);
        } catch (IOException e) {
            log.warn("Could not delete file at: {}", storagePath);
        }
    }

    @Override
    public boolean exists(String storagePath) {
        Path fullPath = resolveFullPath(storagePath);
        return Files.exists(fullPath);
    }

    private Path resolveFullPath(String storagePath) {
        if (storagePath.startsWith("vault/")) {
            String filename = storagePath.substring("vault/".length());
            return vaultPath.resolve(filename).normalize();
        } else if (storagePath.startsWith("evidence/")) {
            String filename = storagePath.substring("evidence/".length());
            return evidencePath.resolve(filename).normalize();
        } else {
            return Paths.get(storagePath).toAbsolutePath().normalize();
        }
    }

    private String getSanitizedExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        String ext = filename.substring(filename.lastIndexOf(".")).toLowerCase();
        // Allow common safe extensions
        if (ext.matches("^\\.[a-z0-9]{1,10}$")) {
            return ext;
        }
        return "";
    }
}
