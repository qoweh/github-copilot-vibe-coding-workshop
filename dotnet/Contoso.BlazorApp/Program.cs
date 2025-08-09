using Contoso.BlazorApp.Components;
using Contoso.BlazorApp.Services;
using Contoso.BlazorApp.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddRazorComponents()
    .AddInteractiveServerComponents();

// Configure API settings (currently minimal)
builder.Services.Configure<ApiSettings>(builder.Configuration.GetSection(ApiSettings.SectionName));

// Auth + state
builder.Services.AddSingleton<AuthState>();

// HTTP client with username header propagation
builder.Services.AddTransient<UsernameHeaderHandler>();
builder.Services.AddHttpClient("Api", client =>
{
    // Use configured base url or fallback
    var baseUrl = builder.Configuration.GetSection(ApiSettings.SectionName).Get<ApiSettings>()?.BaseUrl?.TrimEnd('/') ?? "http://contoso-backend:8080/api";
    client.BaseAddress = new Uri(baseUrl.EndsWith("/api") ? baseUrl + "/" : baseUrl + "/");
    client.DefaultRequestHeaders.Accept.Clear();
    client.DefaultRequestHeaders.Accept.Add(new System.Net.Http.Headers.MediaTypeWithQualityHeaderValue("application/json"));
}).AddHttpMessageHandler<UsernameHeaderHandler>();

// Domain services
builder.Services.AddScoped<PostApiService>();
builder.Services.AddScoped<CommentApiService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Error", createScopeForErrors: true);
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();

app.UseAntiforgery();

app.MapStaticAssets();
app.MapRazorComponents<App>()
    .AddInteractiveServerRenderMode();

app.Run();
