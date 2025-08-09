package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.*;
import com.contoso.socialapp.model.Comment;
import com.contoso.socialapp.service.CommentService;
import com.contoso.socialapp.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/posts/{postId}/comments")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;
    private final PostService postService;

    @GetMapping
    public ResponseEntity<?> list(@PathVariable String postId) {
        if (postService.getPost(postId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error("NOT_FOUND", "Post not found"));
        }
        List<Comment> comments = commentService.list(postId);
        return ResponseEntity.ok(comments);
    }

    @PostMapping
    public ResponseEntity<?> create(@PathVariable String postId, @Validated @RequestBody NewCommentRequest req) {
        if (postService.getPost(postId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error("NOT_FOUND", "Post not found"));
        }
        Comment c = commentService.create(postId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(c);
    }

    @GetMapping("/{commentId}")
    public ResponseEntity<?> get(@PathVariable String postId, @PathVariable String commentId) {
        return commentService.get(postId, commentId)
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(error("NOT_FOUND", "Comment not found")));
    }

    @PatchMapping("/{commentId}")
    public ResponseEntity<?> update(@PathVariable String postId, @PathVariable String commentId, @Validated @RequestBody UpdateCommentRequest req) {
        try {
            return commentService.update(postId, commentId, req)
                    .<ResponseEntity<?>>map(ResponseEntity::ok)
                    .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(error("NOT_FOUND", "Comment not found")));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(error("VALIDATION_ERROR", e.getMessage()));
        }
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> delete(@PathVariable String postId, @PathVariable String commentId) {
        boolean deleted = commentService.delete(postId, commentId);
        if (!deleted) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error("NOT_FOUND", "Comment not found"));
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
