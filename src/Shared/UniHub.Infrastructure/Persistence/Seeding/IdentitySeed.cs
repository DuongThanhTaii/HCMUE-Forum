using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniHub.Identity.Domain.Permissions;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Users.ValueObjects;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds identity data: permissions, roles, and admin user.
/// </summary>
internal static class IdentitySeed
{
    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Permissions.AnyAsync())
        {
            logger.LogInformation("Identity data already seeded. Skipping.");
            return;
        }

        logger.LogInformation("Seeding identity data...");

        // 1. Seed Permissions (format: module.resource.action)
        var permissions = CreatePermissions();
        context.Permissions.AddRange(permissions);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded {Count} permissions.", permissions.Count);

        // 2. Seed Roles
        var adminRole = Role.Create("Admin", "System Administrator with full access").Value;
        var moderatorRole = Role.Create("Moderator", "Forum and content moderator").Value;
        var lecturerRole = Role.Create("Lecturer", "University lecturer with course management").Value;
        var studentRole = Role.Create("Student", "Regular student user", isDefault: true).Value;

        context.Roles.AddRange(adminRole, moderatorRole, lecturerRole, studentRole);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded 4 roles.");

        // 3. Seed Admin User
        var adminEmail = Email.Create("admin@unihub.edu.vn").Value;
        var adminProfile = UserProfile.Create("Admin", "UniHub").Value;
        // Pre-computed BCrypt hash for "Admin@123456" (workFactor: 12)
        var passwordHash = "$2a$12$k312te0PvwsBFoDQ0i9y2ufy5.gzcWlsZDVh5JqVzyrHPgH5bNGbK";
        var adminUser = User.Create(adminEmail, passwordHash, adminProfile).Value;

        context.Users.Add(adminUser);
        await context.SaveChangesAsync();
        logger.LogInformation("Seeded admin user: admin@unihub.edu.vn");
    }

    private static List<Permission> CreatePermissions()
    {
        // Permission code format: {module}.{resource}.{action}
        var permissionData = new[]
        {
            ("identity.users.read", "Read users"),
            ("identity.users.create", "Create users"),
            ("identity.users.update", "Update users"),
            ("identity.users.delete", "Delete users"),
            ("identity.roles.read", "Read roles"),
            ("identity.roles.create", "Create roles"),
            ("identity.roles.update", "Update roles"),
            ("identity.roles.delete", "Delete roles"),
            ("forum.posts.read", "Read posts"),
            ("forum.posts.create", "Create posts"),
            ("forum.posts.update", "Update posts"),
            ("forum.posts.delete", "Delete posts"),
            ("forum.comments.read", "Read comments"),
            ("forum.comments.create", "Create comments"),
            ("forum.comments.update", "Update comments"),
            ("forum.comments.delete", "Delete comments"),
            ("forum.categories.read", "Read categories"),
            ("forum.categories.create", "Create categories"),
            ("forum.categories.update", "Update categories"),
            ("forum.categories.delete", "Delete categories"),
            ("forum.tags.read", "Read tags"),
            ("forum.tags.create", "Create tags"),
            ("forum.tags.update", "Update tags"),
            ("forum.tags.delete", "Delete tags"),
            ("forum.reports.review", "Review reports"),
            ("learning.courses.read", "Read courses"),
            ("learning.courses.create", "Create courses"),
            ("learning.courses.update", "Update courses"),
            ("learning.courses.delete", "Delete courses"),
            ("learning.documents.read", "Read documents"),
            ("learning.documents.create", "Create documents"),
            ("learning.documents.update", "Update documents"),
            ("learning.documents.delete", "Delete documents"),
            ("learning.faculties.read", "Read faculties"),
            ("learning.faculties.create", "Create faculties"),
            ("learning.faculties.update", "Update faculties"),
            ("learning.faculties.delete", "Delete faculties"),
            ("career.companies.read", "Read companies"),
            ("career.companies.create", "Create companies"),
            ("career.companies.update", "Update companies"),
            ("career.companies.delete", "Delete companies"),
            ("career.jobpostings.read", "Read job postings"),
            ("career.jobpostings.create", "Create job postings"),
            ("career.jobpostings.update", "Update job postings"),
            ("career.jobpostings.delete", "Delete job postings"),
            ("chat.channels.read", "Read channels"),
            ("chat.channels.create", "Create channels"),
            ("chat.channels.update", "Update channels"),
            ("chat.channels.delete", "Delete channels"),
            ("notification.notifications.read", "Read notifications"),
            ("notification.notifications.create", "Create notifications"),
            ("notification.notifications.update", "Update notifications"),
            ("notification.notifications.delete", "Delete notifications"),
            ("admin.system.manage", "Full system management access"),
        };

        return permissionData
            .Select(p => Permission.Create(p.Item1, p.Item2).Value)
            .ToList();
    }
}
