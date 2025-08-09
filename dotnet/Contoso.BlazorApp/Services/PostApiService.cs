using System.Net.Http.Json;
using System.Text.Json;

namespace Contoso.BlazorApp.Services;

public class PostApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AuthState _auth;

    public PostApiService(IHttpClientFactory httpClientFactory, AuthState auth)
    {
        _httpClientFactory = httpClientFactory;
        _auth = auth;
    }

    private HttpClient Client => _httpClientFactory.CreateClient("Api");

    public record PostDto(string id, string username, string content, int likesCount, int commentsCount, bool? isLiked, DateTime? createdAt);
    public record CreatePostRequest(string username, string content);
    public record UpdatePostRequest(string username, string content);
    public record LikeRequest(string username);

    public async Task<List<PostDto>> GetPostsAsync()
        => await Client.GetFromJsonAsync<List<PostDto>>("posts") ?? new();

    public async Task<PostDto?> GetPostAsync(string id)
        => await Client.GetFromJsonAsync<PostDto>($"posts/{id}");

    public async Task<PostDto?> CreatePostAsync(string content)
    {
        if(!_auth.IsAuthenticated) throw new InvalidOperationException("User not logged in");
        var req = new CreatePostRequest(_auth.CurrentUser!.Username, content);
        var response = await Client.PostAsJsonAsync("posts", req);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PostDto>();
    }

    public async Task<PostDto?> UpdatePostAsync(string id, string content)
    {
        if(!_auth.IsAuthenticated) throw new InvalidOperationException("User not logged in");
        var req = new UpdatePostRequest(_auth.CurrentUser!.Username, content);
        var response = await Client.PatchAsJsonAsync($"posts/{id}", req);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<PostDto>();
    }

    public async Task DeletePostAsync(string id)
    {
        var response = await Client.DeleteAsync($"posts/{id}");
        response.EnsureSuccessStatusCode();
    }

    public async Task<int> LikeAsync(string postId)
    {
        if(!_auth.IsAuthenticated) throw new InvalidOperationException("User not logged in");
        var req = new LikeRequest(_auth.CurrentUser!.Username);
        var response = await Client.PostAsJsonAsync($"posts/{postId}/likes", req);
        response.EnsureSuccessStatusCode(); // 201 with LikeResponse (no likesCount per spec)
        // Fetch updated post to obtain new likesCount
        var post = await GetPostAsync(postId);
        return post?.likesCount ?? 0;
    }

    public async Task<int> UnlikeAsync(string postId)
    {
        var response = await Client.DeleteAsync($"posts/{postId}/likes");
        response.EnsureSuccessStatusCode(); // 204 No Content
        var post = await GetPostAsync(postId);
        return post?.likesCount ?? 0;
    }
}
