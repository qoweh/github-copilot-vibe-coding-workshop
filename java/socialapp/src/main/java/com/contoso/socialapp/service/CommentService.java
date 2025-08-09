package com.contoso.socialapp.service;

import com.contoso.socialapp.dto.NewCommentRequest;
import com.contoso.socialapp.dto.UpdateCommentRequest;
import com.contoso.socialapp.model.Comment;
import com.contoso.socialapp.repository.CommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TimeProvider timeProvider;

    public List<Comment> list(String postId) {
        return commentRepository.findByPost(postId);
    }

    public Optional<Comment> get(String postId, String commentId) {
        return commentRepository.findById(postId, commentId);
    }

    public Comment create(String postId, NewCommentRequest req) {
        Comment c = new Comment();
        c.setId(java.util.UUID.randomUUID().toString());
        c.setPostId(postId);
        c.setUsername(req.getUsername());
        c.setContent(req.getContent());
        String now = timeProvider.nowIso();
        c.setCreatedAt(now);
        c.setUpdatedAt(now);
        commentRepository.insert(c);
        return c;
    }

    public Optional<Comment> update(String postId, String commentId, UpdateCommentRequest req) {
        Optional<Comment> existing = commentRepository.findById(postId, commentId);
        if (existing.isEmpty()) return Optional.empty();
        Comment c = existing.get();
        if (!c.getUsername().equals(req.getUsername())) {
            throw new IllegalArgumentException("Username mismatch");
        }
        String now = timeProvider.nowIso();
        commentRepository.updateContent(commentId, req.getContent(), now);
        c.setContent(req.getContent());
        c.setUpdatedAt(now);
        return Optional.of(c);
    }

    public boolean delete(String postId, String commentId) {
        return commentRepository.delete(postId, commentId) > 0;
    }
}
