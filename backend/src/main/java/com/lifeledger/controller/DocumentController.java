package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.document.DocumentResponse;
import com.lifeledger.dto.document.DocumentUpdateRequest;
import com.lifeledger.entity.User;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.DocumentService;
import com.lifeledger.service.UserService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final UserService userService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadDocument(
            @CurrentUser UserPrincipal principal,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "title", required = false) String title,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam(value = "expiryDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate expiryDate,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam(value = "tags", required = false) List<String> tags,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentResponse response = documentService.uploadDocument(user, file, title, categoryId, folderId, expiryDate, notes, tags, request);
        return ResponseEntity.ok(ApiResponse.ok("Document uploaded and encrypted with AES-256 successfully", response));
    }

    @PostMapping(value = "/bulk", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> bulkUpload(
            @CurrentUser UserPrincipal principal,
            @RequestParam("files") List<MultipartFile> files,
            @RequestParam("categoryId") Long categoryId,
            @RequestParam(value = "folderId", required = false) Long folderId,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        List<DocumentResponse> responses = new ArrayList<>();
        for (MultipartFile file : files) {
            DocumentResponse resp = documentService.uploadDocument(user, file, null, categoryId, folderId, null, null, null, request);
            responses.add(resp);
        }
        return ResponseEntity.ok(ApiResponse.ok("Bulk upload completed: " + responses.size() + " documents secured", responses));
    }

    @PostMapping(value = "/{id}/versions", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<DocumentResponse>> uploadVersion(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "changeSummary", required = false) String changeSummary,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentResponse response = documentService.uploadNewVersion(user, id, file, changeSummary, request);
        return ResponseEntity.ok(ApiResponse.ok("New version uploaded and secured", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse>>> getDocuments(
            @CurrentUser UserPrincipal principal,
            @RequestParam(value = "categoryId", required = false) Long categoryId,
            @RequestParam(value = "folderId", required = false) Long folderId,
            @RequestParam(value = "favorite", required = false) Boolean favorite,
            @RequestParam(value = "archived", required = false) Boolean archived,
            @RequestParam(value = "deleted", required = false) Boolean deleted,
            @RequestParam(value = "search", required = false) String search) {
        User user = userService.getCurrentUser(principal);
        List<DocumentResponse> list = documentService.getUserDocuments(user, categoryId, folderId, favorite, archived, deleted, search);
        return ResponseEntity.ok(ApiResponse.ok(list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> getDocumentById(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentResponse response = documentService.getDocumentById(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentService.DecryptedFilePayload payload = documentService.getDecryptedDocument(user, id, request);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(payload.mimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + payload.filename() + "\"")
                .body(new ByteArrayResource(payload.data()));
    }

    @GetMapping("/{id}/preview")
    public ResponseEntity<Resource> previewDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentService.DecryptedFilePayload payload = documentService.getDecryptedDocument(user, id, request);

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(payload.mimeType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + payload.filename() + "\"")
                .body(new ByteArrayResource(payload.data()));
    }

    @GetMapping("/{id}/versions")
    public ResponseEntity<ApiResponse<List<DocumentResponse.VersionDto>>> getVersions(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        List<DocumentResponse.VersionDto> versions = documentService.getDocumentVersions(user, id);
        return ResponseEntity.ok(ApiResponse.ok(versions));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DocumentResponse>> updateDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            @Valid @RequestBody DocumentUpdateRequest req,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        DocumentResponse response = documentService.updateDocument(user, id, req, request);
        return ResponseEntity.ok(ApiResponse.ok("Document updated successfully", response));
    }

    @PatchMapping("/{id}/favorite")
    public ResponseEntity<ApiResponse<DocumentResponse>> toggleFavorite(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        DocumentResponse response = documentService.toggleFavorite(user, id);
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> softDeleteDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        documentService.softDeleteDocument(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Document moved to trash", null));
    }

    @PatchMapping("/{id}/restore")
    public ResponseEntity<ApiResponse<Void>> restoreDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        documentService.restoreDocument(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Document restored successfully", null));
    }

    @DeleteMapping("/{id}/permanent")
    public ResponseEntity<ApiResponse<Void>> permanentlyDeleteDocument(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id,
            HttpServletRequest request) {
        User user = userService.getCurrentUser(principal);
        documentService.permanentlyDeleteDocument(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Document permanently deleted from vault", null));
    }
}
