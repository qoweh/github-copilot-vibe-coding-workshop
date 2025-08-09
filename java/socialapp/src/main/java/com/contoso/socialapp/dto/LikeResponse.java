package com.contoso.socialapp.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LikeResponse {
    private String postId;
    private String username;
    private String likedAt;
}
