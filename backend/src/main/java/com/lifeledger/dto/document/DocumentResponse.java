package com.lifeledger.dto.document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DocumentResponse {
    private Long id;
    private String title;
    private String originalFilename;
    private String mimeType;
    private Long fileSize;
    private String formattedFileSize;
    private String checksumSha256;
    private boolean favorite;
    private boolean archived;
    private boolean deleted;
    private LocalDate expiryDate;
    private boolean expired;
    private long daysUntilExpiry;
    private String notes;
    private String extractedMetadataJson;
    private Integer version;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private Long folderId;
    private String folderName;
    private List<TagDto> tags;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TagDto {
        private Long id;
        private String name;
        private String color;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VersionDto {
        private Long id;
        private Integer versionNumber;
        private Long fileSize;
        private String checksumSha256;
        private String changeSummary;
        private LocalDateTime createdAt;
    }
}
