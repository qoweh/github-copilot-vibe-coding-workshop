namespace Contoso.BlazorApp.Services;

public class UsernameHeaderHandler : DelegatingHandler
{
    private readonly AuthService _authService;

    public UsernameHeaderHandler(AuthService authService)
    {
        _authService = authService;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var user = _authService.AuthState.User;
        if (user != null && !string.IsNullOrWhiteSpace(user.Username))
        {
            if (request.Headers.Contains("x-username"))
            {
                request.Headers.Remove("x-username");
            }
            request.Headers.Add("x-username", Uri.EscapeDataString(user.Username));
        }
        return base.SendAsync(request, cancellationToken);
    }
}
