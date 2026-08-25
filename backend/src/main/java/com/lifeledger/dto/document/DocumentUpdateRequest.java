package com.lifeledger.dto.document;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;
import java.util.List;

@Data
public class DocumentUpdateRequest {

    @NotBlank(message = "Title cannot be blank")
    private String title;

    private Long categoryId;
    private Long folderId;
    private LocalDate expiryDate;
    private String notes;
    private Boolean favorite;
    private Boolean archived;
    private List<String> tags;
}
