using System.Text.Json;

namespace Contoso.BlazorApp.Services;

public class AuthState
{
    private const string StorageKey = "user"; // parity with React localStorage key
    private readonly ILogger<AuthState> _logger;

    public AuthState(ILogger<AuthState> logger)
    {
        _logger = logger;
    }

    public UserSession? CurrentUser { get; private set; }
    public bool IsAuthenticated => CurrentUser is not null;

    public Task InitializeAsync() => Task.CompletedTask; // server-side: no localStorage; future: add persistence

    public Task<UserSession> LoginAsync(string username)
    {
        username = username.Trim();
        var user = new UserSession { Username = username };
        CurrentUser = user;
        _logger.LogInformation("User {Username} logged in", username);
        return Task.FromResult(user);
    }

    public void Logout()
    {
        if(CurrentUser != null)
            _logger.LogInformation("User {Username} logged out", CurrentUser.Username);
        CurrentUser = null;
    }
}

public record UserSession
{
    public string Username { get; init; } = string.Empty;
}
