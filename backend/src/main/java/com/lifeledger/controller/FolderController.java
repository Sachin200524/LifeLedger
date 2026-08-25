package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.document.FolderRequest;
import com.lifeledger.entity.Document;
import com.lifeledger.entity.Folder;
import com.lifeledger.entity.User;
import com.lifeledger.exception.ResourceNotFoundException;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.repository.FolderRepository;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/folders")
@RequiredArgsConstructor
public class FolderController {

    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderRequest.FolderDto>>> getFolders(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<Folder> folders = folderRepository.findByUserOrderByCreatedAtDesc(user);
        List<FolderRequest.FolderDto> dtos = folders.stream().map(f -> {
            long count = documentRepository.findByUserAndFolderAndDeletedFalse(user, f).size();
            return FolderRequest.FolderDto.builder()
                    .id(f.getId())
                    .name(f.getName())
                    .color(f.getColor())
                    .parentFolderId(f.getParentFolder() != null ? f.getParentFolder().getId() : null)
                    .documentCount(count)
                    .createdAt(f.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<FolderRequest.FolderDto>> createFolder(
            @CurrentUser UserPrincipal principal,
            @Valid @RequestBody FolderRequest.CreateFolderDto dto) {
        User user = userService.getCurrentUser(principal);

        Folder parent = null;
        if (dto.getParentFolderId() != null) {
            parent = folderRepository.findByIdAndUser(dto.getParentFolderId(), user)
                    .orElseThrow(() -> new ResourceNotFoundException("Parent folder not found"));
        }

        Folder folder = Folder.builder()
                .user(user)
                .name(dto.getName().trim())
                .color(dto.getColor() != null ? dto.getColor() : "#3B82F6")
                .parentFolder(parent)
                .build();

        Folder saved = folderRepository.save(folder);

        FolderRequest.FolderDto res = FolderRequest.FolderDto.builder()
                .id(saved.getId())
                .name(saved.getName())
                .color(saved.getColor())
                .parentFolderId(parent != null ? parent.getId() : null)
                .documentCount(0)
                .createdAt(saved.getCreatedAt())
                .build();

        return ResponseEntity.ok(ApiResponse.ok("Folder created successfully", res));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteFolder(
            @CurrentUser UserPrincipal principal,
            @PathVariable Long id) {
        User user = userService.getCurrentUser(principal);
        Folder folder = folderRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));

        // Unlink docs from folder
        List<Document> docs = documentRepository.findByUserAndFolderAndDeletedFalse(user, folder);
        for (Document d : docs) {
            d.setFolder(null);
        }
        documentRepository.saveAll(docs);

        folderRepository.delete(folder);
        return ResponseEntity.ok(ApiResponse.ok("Folder deleted successfully", null));
    }
}
