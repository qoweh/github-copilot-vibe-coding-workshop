package com.contoso.socialapp.controller;

import com.contoso.socialapp.dto.ErrorResponse;
import com.contoso.socialapp.dto.LikeRequest;
import com.contoso.socialapp.dto.LikeResponse;
import com.contoso.socialapp.service.LikeService;
import com.contoso.socialapp.service.PostService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/posts/{postId}/likes")
@RequiredArgsConstructor
public class LikeController {

    private final LikeService likeService;
    private final PostService postService;

    @PostMapping
    public ResponseEntity<?> like(@PathVariable String postId, @Validated @RequestBody LikeRequest req) {
        if (postService.getPost(postId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error("NOT_FOUND", "Post not found"));
        }
        LikeResponse resp = likeService.like(postId, req);
        return ResponseEntity.status(HttpStatus.CREATED).body(resp);
    }

    @DeleteMapping
    public ResponseEntity<?> unlike(@PathVariable String postId, @RequestBody(required = false) LikeRequest body) {
        if (postService.getPost(postId).isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(error("NOT_FOUND", "Post not found"));
        }
        String username = body != null ? body.getUsername() : null;
        likeService.unlike(postId, username);
        return ResponseEntity.noContent().build();
    }

    private ErrorResponse error(String code, String message) {
        ErrorResponse er = new ErrorResponse();
        er.setError(code);
        er.setMessage(message);
        return er;
    }
}
