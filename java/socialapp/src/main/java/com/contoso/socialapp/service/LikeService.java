package com.contoso.socialapp.service;

import com.contoso.socialapp.dto.LikeRequest;
import com.contoso.socialapp.dto.LikeResponse;
import com.contoso.socialapp.repository.LikeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class LikeService {

    private final LikeRepository likeRepository;
    private final TimeProvider timeProvider;

    public LikeResponse like(String postId, LikeRequest req) {
        String now = timeProvider.nowIso();
        likeRepository.like(postId, req.getUsername(), now);
        return new LikeResponse(postId, req.getUsername(), now);
    }

    public void unlike(String postId, String username) {
        if (username != null && !username.isBlank()) {
            likeRepository.unlike(postId, username);
        } else {
            likeRepository.unlikeAll(postId);
        }
    }
}
