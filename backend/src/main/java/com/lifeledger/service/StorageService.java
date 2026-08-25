package com.lifeledger.service;

public interface StorageService {
    String storeVaultFile(byte[] encryptedBytes, String originalFilename);
    String storeEvidenceFile(byte[] encryptedBytes, String originalFilename);
    byte[] loadFile(String storagePath);
    void deleteFile(String storagePath);
    boolean exists(String storagePath);
}
