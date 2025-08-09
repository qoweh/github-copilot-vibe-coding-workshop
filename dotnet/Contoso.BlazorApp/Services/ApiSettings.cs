namespace Contoso.BlazorApp.Models;

public class ApiSettings
{
    // Match environment variable prefix 'ApiSettings__BaseUrl'
    public const string SectionName = "ApiSettings";
    // Sensible default for containerized environment (service discovery via compose network)
    public string BaseUrl { get; set; } = "http://contoso-backend:8080/api";
}
