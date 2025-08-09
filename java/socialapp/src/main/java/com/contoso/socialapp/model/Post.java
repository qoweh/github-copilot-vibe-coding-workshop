package com.contoso.socialapp.model;

import lombok.Data;

@Data
public class Post {
    private String id;          // UUID
    private String username;    // author username
    private String content;
    private String createdAt;
    private String updatedAt;
    private int likesCount;
    private int commentsCount;
}
