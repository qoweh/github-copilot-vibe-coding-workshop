package com.contoso.socialapp.service;

import com.contoso.socialapp.dto.NewPostRequest;
import com.contoso.socialapp.dto.UpdatePostRequest;
import com.contoso.socialapp.model.Post;
import com.contoso.socialapp.repository.PostRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class PostService {

    private final PostRepository postRepository;
    private final TimeProvider timeProvider;

    public List<Post> listPosts() {
        List<Post> posts = postRepository.findAll();
        posts.forEach(p -> enrichCounts(p));
        return posts;
    }

    public Optional<Post> getPost(String id) {
        Optional<Post> post = postRepository.findById(id);
        post.ifPresent(this::enrichCounts);
        return post;
    }

    public Post create(NewPostRequest req) {
        Post p = new Post();
        p.setId(java.util.UUID.randomUUID().toString());
        p.setUsername(req.getUsername());
        p.setContent(req.getContent());
        String now = timeProvider.nowIso();
        p.setCreatedAt(now);
        p.setUpdatedAt(now);
        postRepository.insert(p);
        enrichCounts(p);
        return p;
    }

    public Optional<Post> update(String id, UpdatePostRequest req) {
        Optional<Post> existing = postRepository.findById(id);
        if (existing.isEmpty()) return Optional.empty();
        Post post = existing.get();
        if (!post.getUsername().equals(req.getUsername())) {
            throw new IllegalArgumentException("Username mismatch");
        }
        String now = timeProvider.nowIso();
        postRepository.updateContent(id, req.getContent(), now);
        post.setContent(req.getContent());
        post.setUpdatedAt(now);
        enrichCounts(post);
        return Optional.of(post);
    }

    public boolean delete(String id) {
        return postRepository.delete(id) > 0;
    }

    private void enrichCounts(Post p) {
        p.setLikesCount(postRepository.countLikes(p.getId()));
        p.setCommentsCount(postRepository.countComments(p.getId()));
    }
}
