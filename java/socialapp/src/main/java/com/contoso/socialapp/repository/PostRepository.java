package com.contoso.socialapp.repository;

import com.contoso.socialapp.model.Post;
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
public class PostRepository {

    private final JdbcTemplate jdbc;

    private final RowMapper<Post> rowMapper = (ResultSet rs, int rowNum) -> {
        Post p = new Post();
        p.setId(rs.getString("id"));
        p.setUsername(rs.getString("username"));
        p.setContent(rs.getString("content"));
        p.setCreatedAt(rs.getString("created_at"));
        p.setUpdatedAt(rs.getString("updated_at"));
        return p;
    };

    public List<Post> findAll() {
        return jdbc.query("SELECT * FROM posts ORDER BY datetime(created_at) DESC", rowMapper);
    }

    public Optional<Post> findById(String id) {
        List<Post> list = jdbc.query("SELECT * FROM posts WHERE id=?", rowMapper, id);
        return list.stream().findFirst();
    }

    public void insert(Post post) {
        jdbc.update("INSERT INTO posts (id, username, content, created_at, updated_at) VALUES (?,?,?,?,?)",
                post.getId(), post.getUsername(), post.getContent(), post.getCreatedAt(), post.getUpdatedAt());
    }

    public int updateContent(String id, String content, String updatedAt) {
        return jdbc.update("UPDATE posts SET content=?, updated_at=? WHERE id=?", content, updatedAt, id);
    }

    public int delete(String id) {
        return jdbc.update("DELETE FROM posts WHERE id=?", id);
    }

    public int countLikes(String postId) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM likes WHERE post_id=?", Integer.class, postId);
        return c == null ? 0 : c;
    }

    public int countComments(String postId) {
        Integer c = jdbc.queryForObject("SELECT COUNT(*) FROM comments WHERE post_id=?", Integer.class, postId);
        return c == null ? 0 : c;
    }
}
