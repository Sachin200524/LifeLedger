package com.lifeledger.dto.document;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

public class FolderRequest {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateFolderDto {
        @NotBlank(message = "Folder name is required")
        private String name;
        private String color;
        private Long parentFolderId;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class FolderDto {
        private Long id;
        private String name;
        private String color;
        private Long parentFolderId;
        private long documentCount;
        private LocalDateTime createdAt;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CategoryDto {
        private Long id;
        private String name;
        private String description;
        private String icon;
        private boolean system;
        private long documentCount;
    }
}
