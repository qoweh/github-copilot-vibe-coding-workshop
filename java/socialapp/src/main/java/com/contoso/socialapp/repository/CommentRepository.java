package com.contoso.socialapp.repository;

import com.contoso.socialapp.model.Comment;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Optional;

@Repository
@RequiredArgsConstructor
public class CommentRepository {

    private final JdbcTemplate jdbc;

    private final RowMapper<Comment> rowMapper = (ResultSet rs, int rowNum) -> {
        Comment c = new Comment();
        c.setId(rs.getString("id"));
        c.setPostId(rs.getString("post_id"));
        c.setUsername(rs.getString("username"));
        c.setContent(rs.getString("content"));
        c.setCreatedAt(rs.getString("created_at"));
        c.setUpdatedAt(rs.getString("updated_at"));
        return c;
    };

    public List<Comment> findByPost(String postId) {
        return jdbc.query("SELECT * FROM comments WHERE post_id=? ORDER BY datetime(created_at) ASC", rowMapper, postId);
    }

    public Optional<Comment> findById(String postId, String commentId) {
        List<Comment> list = jdbc.query("SELECT * FROM comments WHERE id=? AND post_id=?", rowMapper, commentId, postId);
        return list.stream().findFirst();
    }

    public void insert(Comment comment) {
        jdbc.update("INSERT INTO comments (id, post_id, username, content, created_at, updated_at) VALUES (?,?,?,?,?,?)",
                comment.getId(), comment.getPostId(), comment.getUsername(), comment.getContent(), comment.getCreatedAt(), comment.getUpdatedAt());
    }

    public int updateContent(String id, String content, String updatedAt) {
        return jdbc.update("UPDATE comments SET content=?, updated_at=? WHERE id=?", content, updatedAt, id);
    }

    public int delete(String postId, String commentId) {
        return jdbc.update("DELETE FROM comments WHERE id=? AND post_id=?", commentId, postId);
    }
}
