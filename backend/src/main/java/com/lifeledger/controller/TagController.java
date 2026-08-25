package com.lifeledger.controller;

import com.lifeledger.dto.common.ApiResponse;
import com.lifeledger.dto.document.DocumentResponse;
import com.lifeledger.entity.Tag;
import com.lifeledger.entity.User;
import com.lifeledger.repository.TagRepository;
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
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagRepository tagRepository;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<DocumentResponse.TagDto>>> getTags(@CurrentUser UserPrincipal principal) {
        User user = userService.getCurrentUser(principal);
        List<Tag> tags = tagRepository.findByUser(user);
        List<DocumentResponse.TagDto> dtos = tags.stream()
                .map(t -> new DocumentResponse.TagDto(t.getId(), t.getName(), t.getColor()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.ok(dtos));
    }
}
