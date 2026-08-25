package com.lifeledger.service;

import com.lifeledger.dto.document.DocumentResponse;
import com.lifeledger.dto.document.DocumentUpdateRequest;
import com.lifeledger.entity.*;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.exception.SecurityViolationException;
import com.lifeledger.repository.*;
import com.lifeledger.util.FileValidationUtils;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final DocumentVersionRepository versionRepository;
    private final CategoryRepository categoryRepository;
    private final FolderRepository folderRepository;
    private final TagRepository tagRepository;
    private final EncryptionService encryptionService;
    private final StorageService storageService;
    private final MetadataExtractorService metadataExtractorService;
    private final AuditLogService auditLogService;
    private final PolicyDocumentRepository policyDocumentRepository;
    private final EmergencyRequestRepository emergencyRequestRepository;
    private final NomineeRepository nomineeRepository;

    @Transactional
    public DocumentResponse uploadDocument(User user, MultipartFile file, String title,
                                          Long categoryId, Long folderId, LocalDate expiryDate,
                                          String notes, List<String> tagNames, HttpServletRequest request) {
        try {
            byte[] fileBytes = file.getBytes();
            String originalFilename = FileValidationUtils.sanitizeFilename(file.getOriginalFilename());
            String detectedMime = metadataExtractorService.detectMimeType(fileBytes, originalFilename);

            FileValidationUtils.validateFile(file, detectedMime);

            String checksum = FileValidationUtils.calculateSha256(fileBytes);
            String metadataJson = metadataExtractorService.extractMetadataAsJson(fileBytes, originalFilename);

            // Authenticated AES-256-GCM Encryption
            byte[] encryptedBytes = encryptionService.encrypt(fileBytes);

            // Store encrypted payload on disk
            String storagePath = storageService.storeVaultFile(encryptedBytes, originalFilename);

            Category category = categoryRepository.findById(categoryId)
                    .orElseGet(() -> categoryRepository.findByName("Other")
                            .orElseThrow(() -> new ResourceNotFoundException("Default category not found")));

            Folder folder = null;
            if (folderId != null) {
                folder = folderRepository.findByIdAndUser(folderId, user)
                        .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
            }

            Set<Tag> tags = resolveTags(user, tagNames);

            String docTitle = (title != null && !title.trim().isEmpty()) ? title.trim() : originalFilename;

            Document document = Document.builder()
                    .user(user)
                    .category(category)
                    .folder(folder)
                    .title(docTitle)
                    .originalFilename(originalFilename)
                    .encryptedStoragePath(storagePath)
                    .mimeType(detectedMime)
                    .fileSize(file.getSize())
                    .checksumSha256(checksum)
                    .favorite(false)
                    .archived(false)
                    .deleted(false)
                    .expiryDate(expiryDate)
                    .notes(notes)
                    .extractedMetadataJson(metadataJson)
                    .version(1)
                    .tags(tags)
                    .build();

            Document saved = documentRepository.save(document);

            // Create Version 1 record
            DocumentVersion version = DocumentVersion.builder()
                    .document(saved)
                    .versionNumber(1)
                    .encryptedStoragePath(storagePath)
                    .fileSize(file.getSize())
                    .checksumSha256(checksum)
                    .changeSummary("Initial upload")
                    .build();
            versionRepository.save(version);

            auditLogService.logActivity(user, ActivityLog.ActivityAction.UPLOAD_DOCUMENT,
                    "DOC-" + saved.getId(), "Uploaded document: " + saved.getTitle(), request);

            return mapToResponse(saved);
        } catch (Exception e) {
            log.error("Document upload failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload document: " + e.getMessage(), e);
        }
    }

    @Transactional
    public DocumentResponse uploadNewVersion(User user, Long documentId, MultipartFile file,
                                            String changeSummary, HttpServletRequest request) {
        try {
            Document document = documentRepository.findByIdAndUserAndDeletedFalse(documentId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

            byte[] fileBytes = file.getBytes();
            String originalFilename = FileValidationUtils.sanitizeFilename(file.getOriginalFilename());
            String detectedMime = metadataExtractorService.detectMimeType(fileBytes, originalFilename);

            FileValidationUtils.validateFile(file, detectedMime);

            String checksum = FileValidationUtils.calculateSha256(fileBytes);
            String metadataJson = metadataExtractorService.extractMetadataAsJson(fileBytes, originalFilename);

            // Encrypt new file
            byte[] encryptedBytes = encryptionService.encrypt(fileBytes);
            String storagePath = storageService.storeVaultFile(encryptedBytes, originalFilename);

            int nextVersion = document.getVersion() + 1;
            document.setVersion(nextVersion);
            document.setEncryptedStoragePath(storagePath);
            document.setFileSize(file.getSize());
            document.setChecksumSha256(checksum);
            document.setMimeType(detectedMime);
            document.setOriginalFilename(originalFilename);
            document.setExtractedMetadataJson(metadataJson);

            Document saved = documentRepository.save(document);

            DocumentVersion version = DocumentVersion.builder()
                    .document(saved)
                    .versionNumber(nextVersion)
                    .encryptedStoragePath(storagePath)
                    .fileSize(file.getSize())
                    .checksumSha256(checksum)
                    .changeSummary((changeSummary != null && !changeSummary.isEmpty()) ? changeSummary : "Version " + nextVersion)
                    .build();
            versionRepository.save(version);

            auditLogService.logActivity(user, ActivityLog.ActivityAction.UPDATE_DOCUMENT,
                    "DOC-" + saved.getId(), "Uploaded new version v" + nextVersion + " for: " + saved.getTitle(), request);

            return mapToResponse(saved);
        } catch (Exception e) {
            throw new RuntimeException("Failed to upload new document version: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse> getUserDocuments(User user, Long categoryId, Long folderId,
                                                   Boolean favorite, Boolean archived, Boolean deleted, String search) {
        List<Document> docs;

        if (Boolean.TRUE.equals(deleted)) {
            docs = documentRepository.findByUserAndDeletedTrueOrderByUpdatedAtDesc(user);
        } else if (search != null && !search.trim().isEmpty()) {
            docs = documentRepository.searchDocuments(user, search.trim());
        } else if (Boolean.TRUE.equals(favorite)) {
            docs = documentRepository.findByUserAndFavoriteTrueAndDeletedFalse(user);
        } else if (categoryId != null) {
            Category category = categoryRepository.findById(categoryId)
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            docs = documentRepository.findByUserAndCategoryAndDeletedFalse(user, category);
        } else if (folderId != null) {
            Folder folder = folderRepository.findByIdAndUser(folderId, user)
                    .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
            docs = documentRepository.findByUserAndFolderAndDeletedFalse(user, folder);
        } else {
            docs = documentRepository.findByUserAndDeletedFalseOrderByCreatedAtDesc(user);
        }

        if (Boolean.TRUE.equals(archived)) {
            docs = docs.stream().filter(Document::isArchived).collect(Collectors.toList());
        } else if (!Boolean.TRUE.equals(deleted)) {
            docs = docs.stream().filter(d -> !d.isArchived()).collect(Collectors.toList());
        }

        return docs.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DocumentResponse getDocumentById(User currentUser, Long documentId, HttpServletRequest request) {
        Document document = findAndVerifyDocumentAccess(currentUser, documentId);
        auditLogService.logActivity(currentUser, ActivityLog.ActivityAction.VIEW_DOCUMENT,
                "DOC-" + document.getId(), "Viewed metadata of document: " + document.getTitle(), request);
        return mapToResponse(document);
    }

    @Transactional(readOnly = true)
    public DecryptedFilePayload getDecryptedDocument(User currentUser, Long documentId, HttpServletRequest request) {
        Document document = findAndVerifyDocumentAccess(currentUser, documentId);

        byte[] encryptedBytes = storageService.loadFile(document.getEncryptedStoragePath());
        byte[] decryptedBytes = encryptionService.decrypt(encryptedBytes);

        auditLogService.logActivity(currentUser, ActivityLog.ActivityAction.DOWNLOAD_DOCUMENT,
                "DOC-" + document.getId(), "Downloaded/retrieved decrypted document: " + document.getTitle(), request);

        return new DecryptedFilePayload(decryptedBytes, document.getOriginalFilename(), document.getMimeType());
    }

    @Transactional
    public DocumentResponse updateDocument(User user, Long documentId, DocumentUpdateRequest req, HttpServletRequest httpRequest) {
        Document document = documentRepository.findByIdAndUserAndDeletedFalse(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        document.setTitle(req.getTitle().trim());
        document.setExpiryDate(req.getExpiryDate());
        document.setNotes(req.getNotes());

        if (req.getFavorite() != null) {
            document.setFavorite(req.getFavorite());
        }
        if (req.getArchived() != null) {
            document.setArchived(req.getArchived());
        }

        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new ResourceNotFoundException("Category not found"));
            document.setCategory(category);
        }

        if (req.getFolderId() != null) {
            if (req.getFolderId() == 0) {
                document.setFolder(null);
            } else {
                Folder folder = folderRepository.findByIdAndUser(req.getFolderId(), user)
                        .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
                document.setFolder(folder);
            }
        }

        if (req.getTags() != null) {
            document.setTags(resolveTags(user, req.getTags()));
        }

        Document updated = documentRepository.save(document);
        auditLogService.logActivity(user, ActivityLog.ActivityAction.UPDATE_DOCUMENT,
                "DOC-" + updated.getId(), "Updated metadata for document: " + updated.getTitle(), httpRequest);

        return mapToResponse(updated);
    }

    @Transactional
    public DocumentResponse toggleFavorite(User user, Long documentId) {
        Document document = documentRepository.findByIdAndUserAndDeletedFalse(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        document.setFavorite(!document.isFavorite());
        return mapToResponse(documentRepository.save(document));
    }

    @Transactional
    public void softDeleteDocument(User user, Long documentId, HttpServletRequest request) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        document.setDeleted(true);
        documentRepository.save(document);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.DELETE_DOCUMENT,
                "DOC-" + document.getId(), "Moved document to trash: " + document.getTitle(), request);
    }

    @Transactional
    public void restoreDocument(User user, Long documentId, HttpServletRequest request) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        document.setDeleted(false);
        documentRepository.save(document);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.RESTORE_DOCUMENT,
                "DOC-" + document.getId(), "Restored document from trash: " + document.getTitle(), request);
    }

    @Transactional
    public void permanentlyDeleteDocument(User user, Long documentId, HttpServletRequest request) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));

        // Delete all versions from disk
        List<DocumentVersion> versions = versionRepository.findByDocumentOrderByVersionNumberDesc(document);
        for (DocumentVersion v : versions) {
            storageService.deleteFile(v.getEncryptedStoragePath());
        }
        storageService.deleteFile(document.getEncryptedStoragePath());

        // Remove from DB
        versionRepository.deleteAll(versions);
        policyDocumentRepository.deleteAll(policyDocumentRepository.findByDocument(document));
        documentRepository.delete(document);

        auditLogService.logActivity(user, ActivityLog.ActivityAction.PERMANENT_DELETE_DOCUMENT,
                "DOC-" + documentId, "Permanently purged document: " + document.getTitle(), request);
    }

    @Transactional(readOnly = true)
    public List<DocumentResponse.VersionDto> getDocumentVersions(User user, Long documentId) {
        Document document = documentRepository.findByIdAndUser(documentId, user)
                .orElseThrow(() -> new ResourceNotFoundException("Document not found"));
        return versionRepository.findByDocumentOrderByVersionNumberDesc(document).stream()
                .map(v -> DocumentResponse.VersionDto.builder()
                        .id(v.getId())
                        .versionNumber(v.getVersionNumber())
                        .fileSize(v.getFileSize())
                        .checksumSha256(v.getChecksumSha256())
                        .changeSummary(v.getChangeSummary())
                        .createdAt(v.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }

    private Document findAndVerifyDocumentAccess(User user, Long documentId) {
        // Check if user is owner
        Optional<Document> ownDoc = documentRepository.findById(documentId);
        if (ownDoc.isEmpty()) {
            throw new ResourceNotFoundException("Document not found");
        }

        Document document = ownDoc.get();
        if (document.getUser().getId().equals(user.getId())) {
            return document;
        }

        // Check if user is an approved nominee with active emergency access
        List<Nominee> nominees = nomineeRepository.findByNomineeUser(user);
        for (Nominee nominee : nominees) {
            List<EmergencyRequest> approvedRequests = emergencyRequestRepository.findByNomineeOrderByRequestedAtDesc(nominee);
            for (EmergencyRequest req : approvedRequests) {
                if (req.getStatus() == EmergencyRequest.EmergencyStatus.APPROVED) {
                    LocalDateTime now = LocalDateTime.now();
                    if (req.getAccessStartsAt() != null && req.getAccessExpiresAt() != null &&
                            now.isAfter(req.getAccessStartsAt()) && now.isBefore(req.getAccessExpiresAt())) {
                        // Check if this document is part of the policy
                        boolean isPermitted = policyDocumentRepository.findByPolicy(req.getPolicy()).stream()
                                .anyMatch(pd -> pd.getDocument().getId().equals(documentId));
                        if (isPermitted) {
                            return document;
                        }
                    }
                }
            }
        }

        throw new SecurityViolationException("Access denied: You do not have permission to view or download this document");
    }

    private Set<Tag> resolveTags(User user, List<String> tagNames) {
        Set<Tag> tags = new HashSet<>();
        if (tagNames == null || tagNames.isEmpty()) {
            return tags;
        }

        for (String name : tagNames) {
            if (name == null || name.trim().isEmpty()) continue;
            String cleanName = name.trim();
            Tag tag = tagRepository.findByNameAndUser(cleanName, user)
                    .orElseGet(() -> {
                        Tag newTag = Tag.builder()
                                .name(cleanName)
                                .color("#10B981")
                                .user(user)
                                .build();
                        return tagRepository.save(newTag);
                    });
            tags.add(tag);
        }
        return tags;
    }

    public DocumentResponse mapToResponse(Document doc) {
        boolean isExpired = false;
        long daysUntilExpiry = 0;
        if (doc.getExpiryDate() != null) {
            LocalDate today = LocalDate.now();
            isExpired = doc.getExpiryDate().isBefore(today);
            daysUntilExpiry = ChronoUnit.DAYS.between(today, doc.getExpiryDate());
        }

        List<DocumentResponse.TagDto> tagDtos = doc.getTags().stream()
                .map(t -> new DocumentResponse.TagDto(t.getId(), t.getName(), t.getColor()))
                .collect(Collectors.toList());

        return DocumentResponse.builder()
                .id(doc.getId())
                .title(doc.getTitle())
                .originalFilename(doc.getOriginalFilename())
                .mimeType(doc.getMimeType())
                .fileSize(doc.getFileSize())
                .formattedFileSize(FileValidationUtils.formatFileSize(doc.getFileSize()))
                .checksumSha256(doc.getChecksumSha256())
                .favorite(doc.isFavorite())
                .archived(doc.isArchived())
                .deleted(doc.isDeleted())
                .expiryDate(doc.getExpiryDate())
                .expired(isExpired)
                .daysUntilExpiry(daysUntilExpiry)
                .notes(doc.getNotes())
                .extractedMetadataJson(doc.getExtractedMetadataJson())
                .version(doc.getVersion())
                .categoryId(doc.getCategory() != null ? doc.getCategory().getId() : null)
                .categoryName(doc.getCategory() != null ? doc.getCategory().getName() : null)
                .categoryIcon(doc.getCategory() != null ? doc.getCategory().getIcon() : null)
                .folderId(doc.getFolder() != null ? doc.getFolder().getId() : null)
                .folderName(doc.getFolder() != null ? doc.getFolder().getName() : null)
                .tags(tagDtos)
                .createdAt(doc.getCreatedAt())
                .updatedAt(doc.getUpdatedAt())
                .build();
    }

    public record DecryptedFilePayload(byte[] data, String filename, String mimeType) {}
}
