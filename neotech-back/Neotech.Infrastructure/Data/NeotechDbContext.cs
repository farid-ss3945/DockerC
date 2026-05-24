using Microsoft.EntityFrameworkCore;
using Neotech.Domain.Entities;

namespace Neotech.Infrastructure.Data;

public class NeotechDbContext : DbContext
{
    public NeotechDbContext(DbContextOptions<NeotechDbContext> options) : base(options)
    {
    }

    // DbSets
    public DbSet<User> Users { get; set; }
    public DbSet<Category> Categories { get; set; }
    public DbSet<Brand> Brands { get; set; }
    public DbSet<Product> Products { get; set; }
    public DbSet<ProductPrice> ProductPrices { get; set; }
    public DbSet<ProductImage> ProductImages { get; set; }
    public DbSet<Cart> Carts { get; set; }
    public DbSet<CartItem> CartItems { get; set; }
    public DbSet<Filter> Filters { get; set; }
    public DbSet<FilterOption> FilterOptions { get; set; }
    public DbSet<ProductAttributeValue> ProductAttributeValues { get; set; }
    public DbSet<Banner> Banners { get; set; }
    public DbSet<UserFavorite> UserFavorites { get; set; }
    public DbSet<RefreshToken> RefreshTokens { get; set; }
    public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
    public DbSet<ProductSpecification> ProductSpecifications { get; set; }
    public DbSet<DownloadableFile> DownloadableFiles { get; set; }
    public DbSet<ProductPdf> ProductPdfs { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply all configurations from the Configurations folder
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(NeotechDbContext).Assembly);

        // Set default values for audit fields
        foreach (var entityType in modelBuilder.Model.GetEntityTypes())
        {
            var createdAtProperty = entityType.FindProperty("CreatedAt");
            if (createdAtProperty != null && createdAtProperty.ClrType == typeof(DateTime))
            {
                createdAtProperty.SetDefaultValueSql("GETUTCDATE()");
            }
        }
    }
}
