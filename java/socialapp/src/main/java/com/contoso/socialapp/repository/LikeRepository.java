package com.contoso.socialapp.repository;

import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class LikeRepository {

    private final JdbcTemplate jdbc;

    public void like(String postId, String username, String likedAt) {
        try {
            jdbc.update("INSERT INTO likes (post_id, username, liked_at) VALUES (?,?,?)", postId, username, likedAt);
        } catch (DataIntegrityViolationException e) {
            // idempotent: ignore if already exists
        }
    }

    public void unlike(String postId, String username) {
        jdbc.update("DELETE FROM likes WHERE post_id=? AND username=?", postId, username);
    }

    public void unlikeAll(String postId) {
        jdbc.update("DELETE FROM likes WHERE post_id=?", postId);
    }
}
