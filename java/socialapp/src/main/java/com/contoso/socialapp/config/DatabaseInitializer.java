package com.contoso.socialapp.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Component;
import org.springframework.jdbc.core.JdbcTemplate;

@Component
@RequiredArgsConstructor
public class DatabaseInitializer implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) throws Exception {
    // Ensure foreign key constraints are enforced (SQLite off by default per-connection)
    jdbcTemplate.execute("PRAGMA foreign_keys=ON");
        migrateIfNeeded();
    }

    private void migrateIfNeeded() {
        // Check if posts table exists
        var tables = jdbcTemplate.query("SELECT name FROM sqlite_master WHERE type='table' AND name='posts'", (rs, rn) -> rs.getString(1));
        if (tables.isEmpty()) {
            createSchema();
            return;
        }
        // Inspect columns
        var columns = jdbcTemplate.query("PRAGMA table_info(posts)", (RowMapper<String>) (rs, rn) -> rs.getString("name"));
        if (!columns.contains("username")) {
            // Legacy schema -> backup & recreate (simple dev approach)
            jdbcTemplate.execute("ALTER TABLE posts RENAME TO posts_legacy");
            createSchema();
            // Data migration is skipped because original IDs were INT vs UUID; starting fresh aligns with spec.
        }

        // Validate comments table columns (should have: id, post_id, username, content, created_at, updated_at)
        var commentCols = jdbcTemplate.query("SELECT name FROM sqlite_master WHERE type='table' AND name='comments'", (rs, rn) -> rs.getString(1));
        if (!commentCols.isEmpty()) {
            var existing = jdbcTemplate.query("PRAGMA table_info(comments)", (RowMapper<String>) (rs, rn) -> rs.getString("name"));
            if (!(existing.contains("username") && existing.contains("post_id") && existing.contains("updated_at"))) {
                // Drop legacy comments table and recreate
                jdbcTemplate.execute("DROP TABLE comments");
                jdbcTemplate.execute("""
                    CREATE TABLE comments (
                        id TEXT PRIMARY KEY,
                        post_id TEXT NOT NULL,
                        username TEXT NOT NULL,
                        content TEXT NOT NULL,
                        created_at TEXT NOT NULL,
                        updated_at TEXT NOT NULL,
                        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
                    )
                """);
            }
        }

        // Validate likes table (should have: post_id, username, liked_at primary key composite)
        var likeTbl = jdbcTemplate.query("SELECT name FROM sqlite_master WHERE type='table' AND name='likes'", (rs, rn) -> rs.getString(1));
        if (!likeTbl.isEmpty()) {
            var likeCols = jdbcTemplate.query("PRAGMA table_info(likes)", (RowMapper<String>) (rs, rn) -> rs.getString("name"));
            boolean needsRebuild = !(likeCols.contains("post_id") && likeCols.contains("username") && likeCols.contains("liked_at"));
            if (needsRebuild) {
                jdbcTemplate.execute("DROP TABLE likes");
                jdbcTemplate.execute("""
                    CREATE TABLE likes (
                        post_id TEXT NOT NULL,
                        username TEXT NOT NULL,
                        liked_at TEXT NOT NULL,
                        PRIMARY KEY(post_id, username),
                        FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
                    )
                """);
            }
        }
    }

    private void createSchema() {
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS posts (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS comments (
                id TEXT PRIMARY KEY,
                post_id TEXT NOT NULL,
                username TEXT NOT NULL,
                content TEXT NOT NULL,
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        """);
        jdbcTemplate.execute("""
            CREATE TABLE IF NOT EXISTS likes (
                post_id TEXT NOT NULL,
                username TEXT NOT NULL,
                liked_at TEXT NOT NULL,
                PRIMARY KEY(post_id, username),
                FOREIGN KEY(post_id) REFERENCES posts(id) ON DELETE CASCADE
            )
        """);
    }
}
