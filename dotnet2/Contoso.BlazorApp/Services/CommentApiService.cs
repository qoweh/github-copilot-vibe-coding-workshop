using System.Net.Http.Json;
using System.Text.Json;

namespace Contoso.BlazorApp.Services;

public class CommentApiService
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly AuthState _auth;

    public CommentApiService(IHttpClientFactory httpClientFactory, AuthState auth)
    {
        _httpClientFactory = httpClientFactory;
        _auth = auth;
    }

    private HttpClient Client => _httpClientFactory.CreateClient("Api");

    public record CommentDto(string id, string username, string content, DateTime? createdAt);
    public record CreateCommentRequest(string username, string content);
    public record UpdateCommentRequest(string username, string content);

    public async Task<List<CommentDto>> GetCommentsAsync(string postId)
        => await Client.GetFromJsonAsync<List<CommentDto>>($"posts/{postId}/comments") ?? new();

    public async Task<CommentDto?> CreateCommentAsync(string postId, string content)
    {
        if(!_auth.IsAuthenticated) throw new InvalidOperationException("User not logged in");
        var req = new CreateCommentRequest(_auth.CurrentUser!.Username, content);
        var response = await Client.PostAsJsonAsync($"posts/{postId}/comments", req);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CommentDto>();
    }

    public async Task<CommentDto?> UpdateCommentAsync(string postId, string commentId, string content)
    {
        if(!_auth.IsAuthenticated) throw new InvalidOperationException("User not logged in");
        var req = new UpdateCommentRequest(_auth.CurrentUser!.Username, content);
        var response = await Client.PatchAsJsonAsync($"posts/{postId}/comments/{commentId}", req);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<CommentDto>();
    }

    public async Task DeleteCommentAsync(string postId, string commentId)
    {
        var response = await Client.DeleteAsync($"posts/{postId}/comments/{commentId}");
        response.EnsureSuccessStatusCode();
    }
}
