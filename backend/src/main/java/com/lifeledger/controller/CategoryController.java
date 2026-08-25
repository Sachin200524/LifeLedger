package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.document.FolderRequest;
import com.lifeledger.entity.Category;
import com.lifeledger.entity.User;
import com.lifeledger.repository.CategoryRepository;
import com.lifeledger.repository.DocumentRepository;
import com.lifeledger.security.CurrentUser;
import com.lifeledger.security.UserPrincipal;
import com.lifeledger.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryRepository categoryRepository;
    private final DocumentRepository documentRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<FolderRequest.CategoryDto>>> getCategories(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<Category> categories = categoryRepository.findAll();

        List<FolderRequest.CategoryDto> dtos = categories.stream().map(c -> {
            long count = documentRepository.findByUserAndCategoryAndDeletedFalse(user, c).size();
            return FolderRequest.CategoryDto.builder()
                    .id(c.getId())
                    .name(c.getName())
                    .description(c.getDescription())
                    .icon(c.getIcon())
                    .system(c.isSystem())
                    .documentCount(count)
                    .build();
        }).collect(Collectors.toList());

        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }
}
