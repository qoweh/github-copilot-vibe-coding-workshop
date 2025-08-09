package com.contoso.socialapp.model;

import lombok.Data;

@Data
public class Comment {
    private String id;       // UUID
    private String postId;   // parent post UUID
    private String username; // author username
    private String content;
    private String createdAt;
    private String updatedAt;
}
