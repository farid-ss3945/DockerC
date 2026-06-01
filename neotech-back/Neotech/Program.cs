
using Neotech.Infrastructure;
using Neotech.Application;
using Neotech.Application.Configuration;
using Neotech.Filters;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.EntityFrameworkCore;
using System.Text;

namespace Neotech
{
    public class Program
    {
        public static async Task Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddInfrastructure(builder.Configuration);
            builder.Services.AddApplication();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowFrontend", policy =>
                {
                    policy.WithOrigins(
                        "http://16.171.149.77",
                        "http://16.171.149.77:5173",
                        "https://16.171.149.77",
                        "http://16.171.149.77:5056",
                        "https://16.171.149.77:5056",
                        "https://16.171.149.77:5173",
                        "https://neo-techh.netlify.app",
                        "http://neo-techh.netlify.app",
                        "https://13.51.85.33:7222",
                        "https://13.51.85.33:7222"
                    )
                    .AllowAnyHeader()
                    .AllowAnyMethod()
                    .AllowCredentials()
                    .SetIsOriginAllowedToAllowWildcardSubdomains();
                });
            });


            builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
            builder.Services.Configure<Neotech.Infrastructure.Services.EmailSettings>(builder.Configuration.GetSection("EmailSettings"));
            var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.ASCII.GetBytes(jwtSettings!.SecretKey)),
                    ValidateIssuer = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidateAudience = true,
                    ValidAudience = jwtSettings.Audience,
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero
                };
            });

            builder.Services.AddAuthorization();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new Microsoft.OpenApi.Models.OpenApiInfo
                {
                    Title = "Neotech API",
                    Version = "v1",
                    Description = "A comprehensive API with role-based pricing and JWT authentication"
                });

                options.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                {
                    Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.\n\nExample: \"Bearer 12345abcdef\"",
                    Name = "Authorization",
                    In = Microsoft.OpenApi.Models.ParameterLocation.Header,
                    Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
                    Scheme = "Bearer"
                });

                options.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
                {
                    {
                        new Microsoft.OpenApi.Models.OpenApiSecurityScheme
                        {
                            Reference = new Microsoft.OpenApi.Models.OpenApiReference
                            {
                                Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                                Id = "Bearer"
                            }
                        },
                        new string[] {}
                    }
                });

                options.MapType<IFormFile>(() => new Microsoft.OpenApi.Models.OpenApiSchema
                {
                    Type = "string",
                    Format = "binary"
                });

                options.MapType<IFormFileCollection>(() => new Microsoft.OpenApi.Models.OpenApiSchema
                {
                    Type = "array",
                    Items = new Microsoft.OpenApi.Models.OpenApiSchema
                    {
                        Type = "string",
                        Format = "binary"
                    }
                });

                options.EnableAnnotations();
                options.OperationFilter<FileUploadOperationFilter>();
            });

            var app = builder.Build();

            // Add request logging for debugging
            app.Use(async (context, next) =>
            {
                var logger = context.RequestServices.GetRequiredService<ILogger<Program>>();
                var origin = context.Request.Headers.Origin.FirstOrDefault() ?? "Unknown";
                logger.LogInformation("Request: {Method} {Path} from {Origin}", 
                    context.Request.Method, context.Request.Path, origin);
                await next();
            });

            app.UseCors("AllowFrontend");


            // Initialize database with retry logic
            using (var scope = app.Services.CreateScope())
            {
                var context = scope.ServiceProvider.GetRequiredService<Neotech.Infrastructure.Data.NeotechDbContext>();
                var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
                
                try
                {
                    // Apply pending migrations
                    await context.Database.MigrateAsync();
                    
                    // Always run initializer to ensure admin user exists
                    await Neotech.Infrastructure.Data.DbInitializer.InitializeAsync(context);
                    logger.LogInformation("Database initialization completed");
                }
                catch (Exception ex)
                {
                    logger.LogError(ex, "An error occurred while initializing the database. The application will continue but may not function properly.");
                }
            }

            

            app.UseSwagger();
            app.UseSwaggerUI(options =>
            {
                options.SwaggerEndpoint("/swagger/v1/swagger.json", "Neotech API v1");
                options.RoutePrefix = "swagger";
            });

            // Disable HTTPS redirection to avoid mixed content issues
            // app.UseHttpsRedirection();
            app.UseStaticFiles();

            app.UseAuthentication();
            app.UseAuthorization();

            // Add error handling middleware
            app.UseExceptionHandler("/Error");
            app.UseStatusCodePages();

            app.MapControllers();

            app.Run();
        }
    }
}
