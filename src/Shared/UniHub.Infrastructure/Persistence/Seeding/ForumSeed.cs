using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Categories;
using UniHub.Forum.Domain.Categories.ValueObjects;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Comments.ValueObjects;
using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Posts.ValueObjects;
using UniHub.Forum.Domain.Tags;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds forum data: categories and tags.
/// </summary>
internal static class ForumSeed
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        logger.LogInformation("Seeding forum data...");

        // 1. Seed Categories
        if (!await context.Categories.AnyAsync())
        {
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
        }

        // 2. Seed Tags
        if (!await context.Tags.AnyAsync())
        {
            var tagData = new[]
            {
                ("CSharp", "Ngôn ngữ lập trình C#"),
                ("JavaScript", "Ngôn ngữ lập trình JavaScript"),
                ("Python", "Ngôn ngữ lập trình Python"),
                ("DotNet", "Framework .NET"),
                ("React", "Thư viện React.js"),
                ("SQL", "Structured Query Language"),
                ("Git", "Quản lý phiên bản với Git"),
                ("Docker", "Container platform Docker"),
                ("Machine_Learning", "Học máy và AI"),
                ("Web_Development", "Phát triển web"),
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

        // 3. Seed Posts + Comments for quick local FE testing.
        if (!await context.Posts.AnyAsync())
        {
            // Select strongly-typed ids only; .Id.Value is not translatable with EF value converters.
            var firstAuthorKey = await context.Users
                .AsNoTracking()
                .Select(user => user.Id)
                .FirstOrDefaultAsync();
            var systemAuthorId = firstAuthorKey?.Value ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
            if (systemAuthorId == Guid.Empty)
            {
                systemAuthorId = Guid.Parse("00000000-0000-0000-0000-000000000001");
            }

            var categoryKeys = await context.Categories
                .AsNoTracking()
                .Select(category => category.Id)
                .Take(3)
                .ToListAsync();
            var categoryIds = categoryKeys.Select(id => id.Value).ToList();

            var postSeedData = new[]
            {
                (
                    "Chia sẻ lộ trình học C# cho sinh viên năm nhất",
                    "Mình tổng hợp lộ trình từ căn bản đến ASP.NET Core để các bạn mới bắt đầu có thể theo sát trong 8 tuần đầu.",
                    PostType.Discussion
                ),
                (
                    "Hỏi đáp: tối ưu query EF Core khi có nhiều include",
                    "Mọi người có kinh nghiệm nào để giảm thời gian phản hồi cho danh sách bài viết có comment và tag không?",
                    PostType.Question
                ),
                (
                    "Thông báo: workshop React + RTK Query tuần này",
                    "CLB CNTT sẽ tổ chức buổi chia sẻ về React, RTK Query và quy trình migrate frontend vào tối thứ Sáu.",
                    PostType.Announcement
                ),
            };

            var posts = new List<Post>();
            for (var i = 0; i < postSeedData.Length; i++)
            {
                var (titleRaw, contentRaw, type) = postSeedData[i];
                var title = PostTitle.Create(titleRaw).Value;
                var content = PostContent.Create(contentRaw).Value;
                var categoryId = categoryIds.Count > 0 ? categoryIds[i % categoryIds.Count] : (Guid?)null;
                var post = Post.Create(title, content, type, systemAuthorId, categoryId, new[] { "react", "hcmue", "forum" }).Value;
                post.Publish();
                posts.Add(post);
            }

            context.Posts.AddRange(posts);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} forum posts.", posts.Count);

            var comments = new List<Comment>();
            foreach (var post in posts)
            {
                var firstCommentContent = CommentContent.Create("Cảm ơn chia sẻ, thông tin rất hữu ích cho mình.").Value;
                var secondCommentContent = CommentContent.Create("Mình đã thử theo hướng này và hiệu năng cải thiện rõ rệt.").Value;

                comments.Add(Comment.Create(post.Id, systemAuthorId, firstCommentContent).Value);
                comments.Add(Comment.Create(post.Id, systemAuthorId, secondCommentContent).Value);

                post.IncrementCommentCount();
                post.IncrementCommentCount();
            }

            context.Comments.AddRange(comments);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} forum comments.", comments.Count);
        }
    }
}
