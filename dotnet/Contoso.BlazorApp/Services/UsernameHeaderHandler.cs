using System.Net.Http.Headers;

namespace Contoso.BlazorApp.Services;

public class UsernameHeaderHandler : DelegatingHandler
{
    private readonly AuthState _authState;

    public UsernameHeaderHandler(AuthState authState)
    {
        _authState = authState;
    }

    protected override Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        var user = _authState.CurrentUser;
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
