using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Neotech.Domain.Interfaces;
using Neotech.Infrastructure.Data;
using Neotech.Infrastructure.Repositories;

namespace Neotech.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        // Add Entity Framework
        services.AddDbContext<NeotechDbContext>(options =>
            options.UseSqlServer(
                configuration.GetConnectionString("DefaultConnection"),
                b => {
                    b.MigrationsAssembly(typeof(NeotechDbContext).Assembly.FullName);
                    b.EnableRetryOnFailure(
                        maxRetryCount: 5,
                        maxRetryDelay: TimeSpan.FromSeconds(30),
                        errorNumbersToAdd: null);
                    b.CommandTimeout(120);
                }
            ));

        // Add Repository Pattern
        services.AddScoped(typeof(IRepository<>), typeof(Repository<>));
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        // Add Infrastructure Services
        services.AddScoped<Neotech.Application.Services.IJwtService, Neotech.Infrastructure.Services.JwtService>();
        services.AddScoped<Neotech.Application.Services.IPasswordService, Neotech.Infrastructure.Services.PasswordService>();
        services.AddScoped<Neotech.Application.Services.IFileUploadService, Neotech.Infrastructure.Services.FileUploadService>();
        services.AddScoped<Neotech.Application.Services.IEmailService, Neotech.Infrastructure.Services.EmailService>();
        services.AddScoped<Neotech.Application.Services.IImageCompressionService, Neotech.Infrastructure.Services.ImageCompressionService>();

        return services;
    }
}
