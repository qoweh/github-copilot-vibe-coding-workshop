package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.*;
import com.contoso.socialapp.model.Post;
import com.contoso.socialapp.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts")
@RequiredArgsConstructor
public class PostController {

    private final PostService postService;

    @GetMapping
    public ResponseEntity<List<Post>> list() {
        List<Post> posts = postService.listPosts();
        return ResponseEntity.ok(posts);
    }

    @PostMapping
    public ResponseEntity<?> create(@Validated @RequestBody NewPostRequest req) {
        Post p = postService.create(req);
        return ResponseEntity.status(HttpStatus.CREATED).body(p);
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> get(@PathVariable String postId) {
        return postService.getPost(postId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(error("NOT_FOUND", "Post not found")));
    }

    @PatchMapping("/{postId}")
    public ResponseEntity<?> update(@PathVariable String postId, @Validated @RequestBody UpdatePostRequest req) {
        try {
            return postService.update(postId, req)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(error("NOT_FOUND", "Post not found")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("VALIDATION_ERROR", e.getMessage()));
        }
    }

    @DeleteMapping("/{postId}")
    public ResponseEntity<?> delete(@PathVariable String postId) {
        boolean deleted = postService.delete(postId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error("NOT_FOUND", "Post not found"));
        }
        return ResponseEntity.noContent().build();
    }

    private ErrorResponse error(String code, String message) {
        ErrorResponse er = new ErrorResponse();
        er.setError(code);
        er.setMessage(message);
        return er;
    }
}
