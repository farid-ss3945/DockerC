using Neotech.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Identity;

namespace Neotech.Infrastructure.Data;

public static class DbInitializer
{
    public static async Task InitializeAsync(NeotechDbContext context)
    {
        // 1. Seed Categories first if none exist
        var categoryCount = await context.Categories.CountAsync();
        if (categoryCount == 0)
        {
            await SeedAzerbaijaniCategoriesAsync(context);
        }

        // 2. Seed Initial Users (Admin & Test)
        var userCount = await context.Users.CountAsync();
        if (userCount == 0)
        {
            var passwordHasher = new PasswordHasher<User>();
        
            var adminUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Admin",
                LastName = "User",
                Email = "admin@neotech.com",
                Role = UserRole.Admin,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            adminUser.PasswordHash = passwordHasher.HashPassword(adminUser, "Admin123!");

            var testUser = new User
            {
                Id = Guid.NewGuid(),
                FirstName = "Test",
                LastName = "User",
                Email = "test@neotech.com",
                Role = UserRole.NormalUser,
                IsActive = true,
                CreatedAt = DateTime.UtcNow
            };
            testUser.PasswordHash = passwordHasher.HashPassword(testUser, "Test123!");

            await context.Users.AddRangeAsync(adminUser, testUser);
            await context.SaveChangesAsync(); // Commit users
        }

        // 3. Seed Filters & Options (Coupled to guarantee Foreign Key integrity)
        var filterCount = await context.Filters.CountAsync();
        if (filterCount == 0)
        {
            var brandFilter = new Filter
            {
                Id = Guid.NewGuid(),
                Name = "Brand",
                Slug = "brand",
                Type = FilterType.Select,
                IsActive = true,
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow
            };

            var sizeFilter = new Filter
            {
                Id = Guid.NewGuid(),
                Name = "Size",
                Slug = "size",
                Type = FilterType.Select,
                IsActive = true,
                SortOrder = 2,
                CreatedAt = DateTime.UtcNow
            };

            var priceFilter = new Filter
            {
                Id = Guid.NewGuid(),
                Name = "Price Range",
                Slug = "price-range",
                Type = FilterType.Range,
                IsActive = true,
                SortOrder = 3,
                CreatedAt = DateTime.UtcNow
            };

            await context.Filters.AddRangeAsync(brandFilter, sizeFilter, priceFilter);
            await context.SaveChangesAsync(); // Commit filters so IDs physically exist in DB

            // Now safe to seed dependent options safely since filters were missing too
            var brandOptions = new[]
            {
                new FilterOption { Id = Guid.NewGuid(), FilterId = brandFilter.Id, Value = "apple", DisplayName = "Apple", IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow },
                new FilterOption { Id = Guid.NewGuid(), FilterId = brandFilter.Id, Value = "samsung", DisplayName = "Samsung", IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow },
                new FilterOption { Id = Guid.NewGuid(), FilterId = brandFilter.Id, Value = "nike", DisplayName = "Nike", IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow }
            };

            var sizeOptions = new[]
            {
                new FilterOption { Id = Guid.NewGuid(), FilterId = sizeFilter.Id, Value = "s", DisplayName = "Small", IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow },
                new FilterOption { Id = Guid.NewGuid(), FilterId = sizeFilter.Id, Value = "m", DisplayName = "Medium", IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow },
                new FilterOption { Id = Guid.NewGuid(), FilterId = sizeFilter.Id, Value = "l", DisplayName = "Large", IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow }
            };

            await context.FilterOptions.AddRangeAsync(brandOptions);
            await context.FilterOptions.AddRangeAsync(sizeOptions);
            await context.SaveChangesAsync();
        }
        else
        {
            // Optional fallback: If filters exist but somehow options were wiped out
            var filterOptionCount = await context.FilterOptions.CountAsync();
            if (filterOptionCount == 0)
            {
                var dbBrandFilter = await context.Filters.FirstOrDefaultAsync(f => f.Slug == "brand");
                var dbSizeFilter = await context.Filters.FirstOrDefaultAsync(f => f.Slug == "size");

                if (dbBrandFilter != null && dbSizeFilter != null)
                {
                    await context.FilterOptions.AddRangeAsync(
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbBrandFilter.Id, Value = "apple", DisplayName = "Apple", IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow },
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbBrandFilter.Id, Value = "samsung", DisplayName = "Samsung", IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow },
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbBrandFilter.Id, Value = "nike", DisplayName = "Nike", IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow }
                    );

                    await context.FilterOptions.AddRangeAsync(
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbSizeFilter.Id, Value = "s", DisplayName = "Small", IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow },
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbSizeFilter.Id, Value = "m", DisplayName = "Medium", IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow },
                        new FilterOption { Id = Guid.NewGuid(), FilterId = dbSizeFilter.Id, Value = "l", DisplayName = "Large", IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow }
                    );
                    await context.SaveChangesAsync();
                }
            }
        }

        // 4. Seed Banner
        var bannerCount = await context.Banners.CountAsync();
        if (bannerCount == 0)
        {
            var heroBanner = new Banner
            {
                Id = Guid.NewGuid(),
                Title = "Welcome to Neotech",
                ImageUrl = "/uploads/banners/c2148601-15d5-4d95-9c30-1541b6d668da.png",
                LinkUrl = "/",
                ButtonText = "Shop Now",
                Type = BannerType.Hero,
                IsActive = true,
                SortOrder = 1,
                CreatedAt = DateTime.UtcNow
            };

            await context.Banners.AddAsync(heroBanner);
            await context.SaveChangesAsync();
        }
    }

    private static async Task SeedAzerbaijaniCategoriesAsync(NeotechDbContext context)
{
    // 1. Ticarət avadanlıqları
    var ticaret = new Category { Id = Guid.NewGuid(), Name = "Ticarət avadanlıqları", Slug = "ticaret-avadanliqlari", Description = "Ticarət üçün lazım olan avadanlıqlar", IsActive = true, SortOrder = 1, CreatedAt = DateTime.UtcNow };

    // 2. Kompüterlər
    var komputerler = new Category { Id = Guid.NewGuid(), Name = "Kompüterlər", Slug = "komputerler", Description = "Müxtəlif növ kompüterlər", IsActive = true, SortOrder = 2, CreatedAt = DateTime.UtcNow };

    // 3. Noutbuklar
    var noutbuklar = new Category { Id = Guid.NewGuid(), Name = "Noutbuklar", Slug = "noutbuklar", Description = "Müxtəlif növ noutbuklar", IsActive = true, SortOrder = 3, CreatedAt = DateTime.UtcNow };

    // 4. Müşahidə sistemləri
    var musahide = new Category { Id = Guid.NewGuid(), Name = "Müşahidə sistemləri", Slug = "musahide-sistemleri", Description = "Təhlükəsizlik və müşahidə sistemləri", IsActive = true, SortOrder = 4, CreatedAt = DateTime.UtcNow };

    // 5. Kompüter avadanlıqları
    var komputerAvadanliqlari = new Category { Id = Guid.NewGuid(), Name = "Kompüter avadanlıqları", Slug = "komputer-avadanliqlari", Description = "Kompüter üçün avadanlıqlar", IsActive = true, SortOrder = 5, CreatedAt = DateTime.UtcNow };

    // 6. Ofis avadanlıqları
    var ofisAvadanliqlari = new Category { Id = Guid.NewGuid(), Name = "Ofis avadanlıqları", Slug = "ofis-avadanliqlari", Description = "Ofis üçün avadanlıqlar", IsActive = true, SortOrder = 6, CreatedAt = DateTime.UtcNow };

    // 7. Şəbəkə avadanlıqları
    var sebekeAvadanliqlari = new Category { Id = Guid.NewGuid(), Name = "Şəbəkə avadanlıqları", Slug = "sebeke-avadanliqlari", Description = "Şəbəkə üçün avadanlıqlar", IsActive = true, SortOrder = 7, CreatedAt = DateTime.UtcNow };

    await context.Categories.AddRangeAsync(ticaret, komputerler, noutbuklar, musahide, komputerAvadanliqlari, ofisAvadanliqlari, sebekeAvadanliqlari);
    await context.SaveChangesAsync();

    // Subcategories for Ticarət avadanlıqları
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "POS Komputerlər", Slug = "pos-komputerler", Description = "POS sistemlər üçün komputerlər", IsActive = true, SortOrder = 1, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Çek priterlər", Slug = "cek-printerler", Description = "Çek çap edən priterlər", IsActive = true, SortOrder = 2, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Barkod printerlər", Slug = "barkod-printerler", Description = "Barkod çap edən priterlər", IsActive = true, SortOrder = 3, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Mini printerlər", Slug = "mini-printerler", Description = "Kiçik ölçülü priterlər", IsActive = true, SortOrder = 4, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Barkod scanerlər", Slug = "barkod-scanerler", Description = "Barkod oxuyan cihazlar", IsActive = true, SortOrder = 5, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Tərəzilər", Slug = "tereziler", Description = "Çəki ölçən tərəzilər", IsActive = true, SortOrder = 6, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Pul yeşikləri", Slug = "pul-yesikleri", Description = "Pul saxlama yeşikləri", IsActive = true, SortOrder = 7, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Çek və Barkod kağızları", Slug = "cek-ve-barkod-kagizlari", Description = "Çek və barkod üçün kağızlar", IsActive = true, SortOrder = 8, ParentCategoryId = ticaret.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Kompüterlər
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Ofis Kompüterləri", Slug = "ofis-komputerleri", Description = "Ofis işləri üçün kompüterlər", IsActive = true, SortOrder = 1, ParentCategoryId = komputerler.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Oyun və Dizayn Kompüterləri", Slug = "oyun-ve-dizayn-komputerleri", Description = "Oyun və dizayn üçün güclü kompüterlər", IsActive = true, SortOrder = 2, ParentCategoryId = komputerler.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Monoboklar", Slug = "monoboklar", Description = "Bir hissədə kompüterlər", IsActive = true, SortOrder = 3, ParentCategoryId = komputerler.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Mini Kompüterləri", Slug = "mini-komputerleri", Description = "Kiçik ölçülü kompüterlər", IsActive = true, SortOrder = 4, ParentCategoryId = komputerler.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Noutbuklar
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Ofis Noutbukları", Slug = "ofis-noutbuklari", Description = "Ofis işləri üçün noutbuklar", IsActive = true, SortOrder = 1, ParentCategoryId = noutbuklar.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Oyun Noutbukları", Slug = "oyun-noutbuklari", Description = "Oyun üçün güclü noutbuklar", IsActive = true, SortOrder = 2, ParentCategoryId = noutbuklar.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Planşet tipli", Slug = "planset-tipli", Description = "Planşet tipli noutbuklar", IsActive = true, SortOrder = 3, ParentCategoryId = noutbuklar.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Müşahidə sistemləri
    var analoq = new Category { Id = Guid.NewGuid(), Name = "Analoq Kamera sistemləri", Slug = "analoq-kamera-sistemleri", Description = "Analoq kamera sistemləri", IsActive = true, SortOrder = 1, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow };
    var ip = new Category { Id = Guid.NewGuid(), Name = "İP Kamera sistemləri", Slug = "ip-kamera-sistemleri", Description = "İP kamera sistemləri", IsActive = true, SortOrder = 2, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow };
    var yaddas = new Category { Id = Guid.NewGuid(), Name = "Yaddaş Qurğuları", Slug = "yaddas-qurgulari", Description = "Yaddaş qurğuları", IsActive = true, SortOrder = 4, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow };

    await context.Categories.AddRangeAsync(
        analoq,
        ip,
        new Category { Id = Guid.NewGuid(), Name = "WIFI Kameraları", Slug = "wifi-kameralari", Description = "WIFI kameralar", IsActive = true, SortOrder = 3, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow },
        yaddas,
        new Category { Id = Guid.NewGuid(), Name = "Damafonlar", Slug = "damafonlar", Description = "Damafon sistemləri", IsActive = true, SortOrder = 5, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Access Control", Slug = "access-control", Description = "Giriş nəzarət sistemləri", IsActive = true, SortOrder = 6, ParentCategoryId = musahide.Id, CreatedAt = DateTime.UtcNow }
    );
    await context.SaveChangesAsync();

    // Sub-subcategories for Analoq Kamera sistemləri
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Kamera", Slug = "kamera", Description = "Analoq kameralar", IsActive = true, SortOrder = 1, ParentCategoryId = analoq.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "DVR", Slug = "dvr", Description = "DVR qurğuları", IsActive = true, SortOrder = 2, ParentCategoryId = analoq.Id, CreatedAt = DateTime.UtcNow }
    );

    // Sub-subcategories for İP Kamera sistemləri
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Kamera", Slug = "ip-kamera", Description = "İP kameralar", IsActive = true, SortOrder = 1, ParentCategoryId = ip.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "NVR", Slug = "nvr", Description = "NVR qurğuları", IsActive = true, SortOrder = 2, ParentCategoryId = ip.Id, CreatedAt = DateTime.UtcNow }
    );

    // Sub-subcategories for Yaddaş Qurğuları
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "HDD", Slug = "hdd", Description = "Hard disk sürücüləri", IsActive = true, SortOrder = 1, ParentCategoryId = yaddas.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Mikro SD", Slug = "mikro-sd", Description = "Mikro SD kartlar", IsActive = true, SortOrder = 2, ParentCategoryId = yaddas.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Kompüter avadanlıqları
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Monitor", Slug = "monitor", Description = "Kompüter monitorları", IsActive = true, SortOrder = 1, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "SSD", Slug = "ssd", Description = "SSD sürücüləri", IsActive = true, SortOrder = 2, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "HDD", Slug = "hdd-avadanliq", Description = "Hard disk sürücüləri", IsActive = true, SortOrder = 3, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "RAM", Slug = "ram", Description = "RAM yaddaşları", IsActive = true, SortOrder = 4, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "CPU", Slug = "cpu", Description = "Prosessorlar", IsActive = true, SortOrder = 5, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Case", Slug = "case", Description = "Kompüter qutuları", IsActive = true, SortOrder = 6, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Qida Bloku", Slug = "qida-bloku", Description = "Qida blokları", IsActive = true, SortOrder = 7, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Qulaqlıq", Slug = "qulaqliq", Description = "Qulaqlıqlar", IsActive = true, SortOrder = 8, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Klavyatura", Slug = "klavyatura", Description = "Klavyaturalar", IsActive = true, SortOrder = 9, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Maus", Slug = "maus", Description = "Mauslar", IsActive = true, SortOrder = 10, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Dinamik", Slug = "dinamik", Description = "Dinamiklər", IsActive = true, SortOrder = 11, ParentCategoryId = komputerAvadanliqlari.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Ofis avadanlıqları
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "UPS", Slug = "ups", Description = "UPS sistemləri", IsActive = true, SortOrder = 1, ParentCategoryId = ofisAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Printer", Slug = "printer", Description = "Priterlər", IsActive = true, SortOrder = 2, ParentCategoryId = ofisAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Uzadıcı", Slug = "uzadici", Description = "Uzadıcılar", IsActive = true, SortOrder = 3, ParentCategoryId = ofisAvadanliqlari.Id, CreatedAt = DateTime.UtcNow }
    );

    // Subcategories for Şəbəkə avadanlıqları
    await context.Categories.AddRangeAsync(
        new Category { Id = Guid.NewGuid(), Name = "Router", Slug = "router", Description = "Routerlər", IsActive = true, SortOrder = 1, ParentCategoryId = sebekeAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Access point", Slug = "access-point", Description = "Access pointlər", IsActive = true, SortOrder = 2, ParentCategoryId = sebekeAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Range extender", Slug = "range-extender", Description = "Range extenderlər", IsActive = true, SortOrder = 3, ParentCategoryId = sebekeAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Switch", Slug = "switch", Description = "Switchlər", IsActive = true, SortOrder = 4, ParentCategoryId = sebekeAvadanliqlari.Id, CreatedAt = DateTime.UtcNow },
        new Category { Id = Guid.NewGuid(), Name = "Wifi adapter", Slug = "wifi-adapter", Description = "Wifi adapterlər", IsActive = true, SortOrder = 5, ParentCategoryId = sebekeAvadanliqlari.Id, CreatedAt = DateTime.UtcNow }
    );

    await context.SaveChangesAsync();
}
}
