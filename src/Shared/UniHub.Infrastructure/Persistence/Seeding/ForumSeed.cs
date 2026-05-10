using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniHub.Forum.Domain.Categories;
using UniHub.Forum.Domain.Categories.ValueObjects;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Comments.ValueObjects;
using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Posts.ValueObjects;
using UniHub.Forum.Domain.Tags;
using UniHub.Forum.Domain.ThreadChannels;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds forum data: categories and tags.
/// </summary>
internal static class ForumSeed
{
    /// <summary>Anchor post for the &quot;general&quot; thread channel: long-form, realistic campus content (not a &quot;demo&quot; stub).</summary>
    private const string ShowcaseGeneralThreadTitle =
        "Sống và học ở HCMUE: kinh nghiệm cân bằng chuyên môn, hoạt động ngoại khóa và sức khỏe tinh thần";

    private static readonly string ShowcaseGeneralThreadBody = """
Xin chào mọi người, mình là sinh viên năm ba, khoa tự nhiên. Sau hơn hai năm gắn bó với HCMUE, mình muốn viết một bài thật “đủ thịt” — không phải checklist sáo rỗng — để các bạn mới vào hoặc đang cảm thấy quá tải có thể tham khảo.

**1. Học bền vững hơn học “nước rút”**

Mình từng lệ thuộc deadline: cày đêm trước kỳ thi, cày qua ngày nộp bài. Kết quả là điểm có khi ổn nhưng kiến thức không ăn sâu, sau nghỉ hè là quên gần hết. Cách mình đổi dần:

• Chia nhỏ mục tiêu theo tuần: mỗi môn ít nhất 2–3 khối ôn tập ngắn (45–60 phút), ghi chú ngay chỗ chưa hiểu để hỏi giảng viên hoặc bạn cùng lớp.
• Ưu tiên buổi sáng ở thư viện hoặc khu tự học yên tĩnh; chiều dành cho bài tập nhóm hoặc thực hành.
• Dùng một cuốn sổ (hoặc file) thống nhất cho từng môn: công thức, ví dụ điển hình, lỗi mình hay mắc — sau này ôn thi chỉ cần lật lại phần đó.

**2. Tận dụng tài nguyên trong trường**

HCMUE có nhiều kênh hỗ trợ mà đôi khi mình chỉ nhận ra khi đã muộn: tài liệu tham khảo ở thư viện, buổi tư vấn học tập, các CLB chuyên môn và cả các workshop kỹ năng mềm. Mình khuyên các bạn:

• Tham ít nhất một hoạt động ngoại khóa “đúng gu” chuyên ngành hoặc đúng sở thích — không cần ôm ba bốn CLB cùng lúc.
• Chủ động xin gặp giảng viên hướng dẫn khi định hướng đề tài, thực tập hoặc học bổng; email ngắn gọn, kèm câu hỏi cụ thể thường được trả lời nhanh hơn tin nhắn chung chung.

**3. Mối quan hệ và ranh giới**

Ở giảng đường, bạn bè là nguồn lực lớn: nhóm học đều đặn giúp mình hiểu bài nhanh hơn tự đọc một mình. Nhưng cũng cần ranh giới: từ chối nhẹ nhàng khi bị kéo vào deadline hộ quá thường xuyên, hoặc khi nhóm làm việc không chia việc rõ ràng. Mình hay dùng bảng Trello/Notion tối giản: ai làm phần nào, hạn nào, họp 15 phút đầu tuần để chỉnh lịch.

**4. Sức khỏe thể chất và tinh thần**

Ngủ đủ, vận động nhẹ và nói chuyện với người tin tưởng không phải là “lãng phí thời gian” — đó là phần giữ cho mình học được lâu dài. Nếu có giai đoạn trầm cảm, lo âu kéo dài, hãy tìm hỗ trợ chuyên môn sớm; điều đó không có nghĩa là bạn yếu đuối.

**Lời kết**

Mỗi người một hoàn cảnh; bài này chỉ là một cách tiếp cận mình đã thử và thấy ổn. Rất mong được nghe thêm kinh nghiệm của các bạn ở các khoa khác — có thể chúng ta cùng bổ sung thành một “cẩm nang” mở cho cộng đồng sinh viên HCMUE.

Chúc mọi người một học kỳ bình an và tiến bộ rõ rệt.
""";

    private static readonly string[] ShowcaseGeneralThreadComments =
    {
        "Đọc xong mình thấy đỡ lo hơn hẳn — đặc biệt phần chia nhỏ mục tiêu theo tuần. Cảm ơn bạn đã viết chi tiết như vậy.",
        "Mình năm nhất, đang cố tìm nhịp học ổn định. Bạn có thể chia sẻ thêm ví dụ cụ thể về khung thời gian một ngày bình thường của bạn không?",
        "Phần ranh giới nhóm học rất thực tế. Mình từng ôm việc hộ cả nhóm đến kiệt sức; giờ sẽ thử bảng chia việc như bạn gợi ý.",
        "Mình đồng ý phần sức khỏe tinh thần — có kỳ mình cố quá dẫn đến burnout, sau đó phải nghỉ giải lao lâu mới lấy lại nhịp.",
        "Bài viết có thể pin làm tài liệu cho tân sinh viên được. Mong diễn đàn có thêm các chia sẻ tương tự từ các khoa khác.",
    };

    private static readonly string[] DefaultThreadReplyComments =
    {
        "Cảm ơn bạn đã chia sẻ, nội dung rất hữu ích.",
        "Mình đã áp dụng một phần và thấy hiệu quả rõ rệt sau vài tuần.",
    };

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

        // 2.5 Seed official thread channels (VOZ-style).
        if (!await context.ThreadChannels.AnyAsync())
        {
            var channelData = new[]
            {
                ("general", "General Thread", "Open discussion threads for campus life and casual exchange.", 10, true, true, true, true),
                ("qna", "Q&A Thread", "Question-first channel where accepted answers are encouraged.", 20, true, true, true, true),
                ("tech", "Tech Corner", "Technical debates and engineering deep dives.", 30, true, true, false, true),
                ("buy-sell", "Marketplace", "Buy/sell and exchange. Pin/accepted is disabled to reduce abuse.", 40, true, false, false, true),
            };

            var channels = channelData
                .Select(row => ThreadChannel.Create(
                    row.Item1,
                    row.Item2,
                    row.Item3,
                    row.Item4,
                    row.Item5,
                    row.Item6,
                    row.Item7,
                    row.Item8))
                .ToList();

            context.ThreadChannels.AddRange(channels);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} thread channels.", channels.Count);
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

            var allCategories = await context.Categories.AsNoTracking().ToListAsync();
            var lifestyleCategory = allCategories.FirstOrDefault(c => c.Name.Value == "Đời sống sinh viên");

            var postSeedData = new[]
            {
                (
                    ShowcaseGeneralThreadTitle,
                    ShowcaseGeneralThreadBody.Trim(),
                    PostType.Discussion,
                    "general"
                ),
                (
                    "EF Core: giảm chi phí Include/ProjectTo khi list bài kèm tag và category",
                    "Mình đang tối ưu API danh sách bài viết: mỗi bài có category, vài tag và đếm comment. Khi Include nhiều tầng thì thời gian phản hồi tăng rõ. Mọi người thường chọn AsSplitQuery, giới họn cột, hay chuyển sang projection/DTO từ đầu? Mình muốn nghe case thực tế hơn là lý thuyết chung chung.",
                    PostType.Question,
                    "qna"
                ),
                (
                    "Gợi ý kiến trúc frontend: tách slice RTK Query theo feature hay theo domain API?",
                    "Nhóm mình đang chuẩn hóa codebase React sau một kỳ thực tập. Đang phân vân giữa injectEndpoints theo từng feature (forum, chat, career) và gom theo nhóm REST. Bạn nào đã migrate từ bundle lớn sang kiến trúc module, chia sẻ giúp mình vài bài học được không?",
                    PostType.Discussion,
                    "tech"
                ),
            };

            var threadChannelMap = await context.ThreadChannels
                .AsNoTracking()
                .ToDictionaryAsync(x => x.Code, x => x.Id);

            var posts = new List<Post>();
            for (var i = 0; i < postSeedData.Length; i++)
            {
                var (titleRaw, contentRaw, type, channelCode) = postSeedData[i];
                var title = PostTitle.Create(titleRaw).Value;
                var content = PostContent.Create(contentRaw).Value;
                Guid? categoryId = null;
                if (allCategories.Count > 0)
                {
                    categoryId = i == 0 && lifestyleCategory is not null
                        ? lifestyleCategory.Id.Value
                        : allCategories[i % allCategories.Count].Id.Value;
                }

                threadChannelMap.TryGetValue(channelCode, out var threadChannelId);
                var tagSet = i switch
                {
                    0 => new[] { "thread", "thread:doi-song-hoc-tap", "hcmue", "hoc-tap", "kinh-nghiem", "doi-song-sinh-vien" },
                    1 => new[] { "efcore", "dotnet", "performance", "sql", "Tips" },
                    _ => new[] { "react", "frontend", "architecture", "rtk-query", "hcmue" },
                };

                var post = Post.Create(
                    title,
                    content,
                    type,
                    systemAuthorId,
                    categoryId,
                    tagSet,
                    threadChannelId == Guid.Empty ? null : threadChannelId).Value;
                post.Publish();
                posts.Add(post);
            }

            context.Posts.AddRange(posts);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} forum posts.", posts.Count);

            var comments = new List<Comment>();
            for (var i = 0; i < posts.Count; i++)
            {
                var post = posts[i];
                var templates = i == 0 ? ShowcaseGeneralThreadComments : DefaultThreadReplyComments;
                foreach (var line in templates)
                {
                    var body = CommentContent.Create(line).Value;
                    comments.Add(Comment.Create(post.Id, systemAuthorId, body).Value);
                    post.IncrementCommentCount();
                }
            }

            context.Comments.AddRange(comments);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded {Count} forum comments.", comments.Count);
        }

        await EnsureGeneralThreadShowcaseIfEmptyAsync(context, logger);
    }

    /// <summary>
    /// If the database already had posts but nothing in the &quot;general&quot; thread channel, add the showcase thread once (safe to run repeatedly).
    /// </summary>
    private static async Task EnsureGeneralThreadShowcaseIfEmptyAsync(ApplicationDbContext context, ILogger logger)
    {
        var generalChannelId = await context.ThreadChannels
            .AsNoTracking()
            .Where(c => c.Code == "general")
            .Select(c => c.Id)
            .FirstOrDefaultAsync();

        if (generalChannelId == Guid.Empty)
        {
            return;
        }

        var hasGeneralPost = await context.Posts.AnyAsync(p => p.ThreadChannelId == generalChannelId);
        if (hasGeneralPost)
        {
            return;
        }

        var firstAuthorKey = await context.Users
            .AsNoTracking()
            .Select(user => user.Id)
            .FirstOrDefaultAsync();
        var systemAuthorId = firstAuthorKey?.Value ?? Guid.Parse("00000000-0000-0000-0000-000000000001");
        if (systemAuthorId == Guid.Empty)
        {
            systemAuthorId = Guid.Parse("00000000-0000-0000-0000-000000000001");
        }

        var categories = await context.Categories.AsNoTracking().ToListAsync();
        if (categories.Count == 0)
        {
            logger.LogWarning("Cannot backfill general thread showcase: no categories.");
            return;
        }

        var lifestyleCategory = categories.FirstOrDefault(c => c.Name.Value == "Đời sống sinh viên");
        var categoryId = lifestyleCategory?.Id.Value ?? categories[0].Id.Value;

        var title = PostTitle.Create(ShowcaseGeneralThreadTitle).Value;
        var body = PostContent.Create(ShowcaseGeneralThreadBody.Trim()).Value;
        var tagSet = new[] { "thread", "thread:doi-song-hoc-tap", "hcmue", "hoc-tap", "kinh-nghiem", "doi-song-sinh-vien" };

        var post = Post.Create(
            title,
            body,
            PostType.Discussion,
            systemAuthorId,
            categoryId,
            tagSet,
            generalChannelId).Value;
        post.Publish();

        context.Posts.Add(post);
        await context.SaveChangesAsync();

        var comments = new List<Comment>();
        foreach (var line in ShowcaseGeneralThreadComments)
        {
            var c = CommentContent.Create(line).Value;
            comments.Add(Comment.Create(post.Id, systemAuthorId, c).Value);
            post.IncrementCommentCount();
        }

        context.Comments.AddRange(comments);
        await context.SaveChangesAsync();

        logger.LogInformation("Backfilled showcase post for general thread channel (no prior posts in that channel).");
    }

}
