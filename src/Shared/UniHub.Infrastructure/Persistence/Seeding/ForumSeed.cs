using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Categories;
using UniHub.Forum.Domain.Categories.ValueObjects;
using UniHub.Forum.Domain.Tags;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds forum data: categories and tags.
/// </summary>
internal static class ForumSeed
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Categories.AnyAsync())
        {
            logger.LogInformation("Forum data already seeded. Skipping.");
            return;
        }

        logger.LogInformation("Seeding forum data...");

        // 1. Seed Categories
        var categoryData = new[]
        {
            ("Thảo luận chung", "Thảo luận mọi chủ đề liên quan đến đại học"),
            ("Học tập", "Chia sẻ tài liệu, kinh nghiệm học tập"),
            ("Hỏi đáp", "Đặt câu hỏi và nhận giải đáp"),
            ("Công nghệ", "Thảo luận về công nghệ, lập trình"),
            ("Tuyển dụng", "Thông tin tuyển dụng, thực tập"),
            ("Đời sống sinh viên", "Chia sẻ kinh nghiệm đời sống"),
            ("Sự kiện", "Thông tin sự kiện, hoạt động"),
            ("Góp ý", "Góp ý, phản hồi về UniHub"),
        };

        var categories = new List<Category>();
        foreach (var (name, desc) in categoryData)
        {
            var nameVo = CategoryName.Create(name).Value;
            var descVo = CategoryDescription.Create(desc).Value;
            categories.Add(Category.Create(nameVo, descVo).Value);
        }

        context.Categories.AddRange(categories);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} categories.", categories.Count);

        // 2. Seed Tags
        var tagData = new[]
        {
            ("C#", "Ngôn ngữ lập trình C#"),
            ("JavaScript", "Ngôn ngữ lập trình JavaScript"),
            ("Python", "Ngôn ngữ lập trình Python"),
            (".NET", "Framework .NET"),
            ("React", "Thư viện React.js"),
            ("SQL", "Structured Query Language"),
            ("Git", "Quản lý phiên bản với Git"),
            ("Docker", "Container platform Docker"),
            ("Machine Learning", "Học máy và AI"),
            ("Web Development", "Phát triển web"),
            ("Mobile", "Phát triển ứng dụng di động"),
            ("Database", "Cơ sở dữ liệu"),
            ("Algorithm", "Thuật toán và cấu trúc dữ liệu"),
            ("Career", "Định hướng nghề nghiệp"),
            ("Tips", "Mẹo hay và kinh nghiệm"),
        };

        var tags = new List<Tag>();
        var tagId = 1;
        foreach (var (name, desc) in tagData)
        {
            tags.Add(Tag.Create(TagId.Create(tagId++), name, desc).Value);
        }

        context.Tags.AddRange(tags);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} tags.", tags.Count);
    }
}
