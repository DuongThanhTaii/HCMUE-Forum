using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using UniHub.Identity.Domain.Permissions;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Users.ValueObjects;

namespace UniHub.Infrastructure.Persistence.Seeding;

/// <summary>
/// Seeds identity data: permissions, roles, admin user, and idempotent demo accounts.
/// </summary>
internal static class IdentitySeed
{
    /// <summary>Pre-computed BCrypt hash for "Admin@123456" (workFactor: 12). Shared by seeded dev accounts.</summary>
    private const string DevSeedPasswordHash =
        "$2a$12$k312te0PvwsBFoDQ0i9y2ufy5.gzcWlsZDVh5JqVzyrHPgH5bNGbK";

    /// <summary>
    /// Fixed well-known ID for the seeded admin user.
    /// Must match DefaultActorId used by LearningBulkSeed so uploaderName resolves correctly.
    /// </summary>
    internal static readonly Guid AdminSeedId = Guid.Parse("00000000-0000-0000-0000-000000000001");

    public static async Task SeedAsync(ApplicationDbContext context, ILogger logger)
    {
        if (await context.Permissions.AnyAsync())
        {
            logger.LogInformation("Identity bootstrap already present. Skipping permissions, roles, and admin seed.");
        }
        else
        {
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

            // 3. Seed Admin User with a fixed well-known ID so seeded documents can resolve the uploader name.
            var adminEmail = Email.Create("admin@unihub.edu.vn").Value;
            var adminProfile = UserProfile.Create("Admin", "UniHub").Value;
            var adminUser = User.CreateWithId(
                UserId.Create(AdminSeedId),
                adminEmail,
                DevSeedPasswordHash,
                adminProfile).Value;
            var assignAdminRoleResult = adminUser.AssignRole(adminRole.Id);
            if (assignAdminRoleResult.IsFailure)
            {
                throw new InvalidOperationException(
                    $"Failed to assign Admin role to seeded admin user: {assignAdminRoleResult.Error.Message}");
            }

            context.Users.Add(adminUser);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded admin user with Admin role: admin@unihub.edu.vn");
        }

        await EnsureDemoAccountsAsync(context, logger);
    }

    /// <summary>
    /// Adds moderator / lecturer / student demo logins if missing (safe on existing databases).
    /// Password for all: Admin@123456 (same as seeded admin).
    /// </summary>
    private static async Task EnsureDemoAccountsAsync(ApplicationDbContext context, ILogger logger)
    {
        if (!await context.Roles.AnyAsync())
        {
            return;
        }

        var roles = await context.Roles.AsNoTracking().ToListAsync();
        var roleByName = roles.ToDictionary(r => r.Name, StringComparer.Ordinal);

        var demoAccounts = new (string Email, string FirstName, string LastName, string RoleName)[]
        {
            ("moderator@unihub.edu.vn", "Moderation", "Demo", "Moderator"),
            ("lecturer@unihub.edu.vn", "Lecturer", "Demo", "Lecturer"),
            ("student@unihub.edu.vn", "Student", "Demo", "Student"),
            ("student2@unihub.edu.vn", "Sinh viên", "Hai", "Student"),
            ("student3@unihub.edu.vn", "Sinh viên", "Ba", "Student"),
            ("forum.test1@unihub.edu.vn", "Forum", "Tester One", "Student"),
        };

        foreach (var (email, firstName, lastName, roleName) in demoAccounts)
        {
            var emailResult = Email.Create(email);
            if (emailResult.IsFailure)
            {
                continue;
            }

            var emailVo = emailResult.Value;
            if (await context.Users.AnyAsync(u => u.Email == emailVo))
            {
                continue;
            }

            if (!roleByName.TryGetValue(roleName, out var role))
            {
                logger.LogWarning("Demo user {Email} skipped: role {RoleName} not found.", email, roleName);
                continue;
            }

            var profileResult = UserProfile.Create(firstName, lastName);
            if (profileResult.IsFailure)
            {
                logger.LogWarning("Demo user {Email} skipped: invalid profile.", email);
                continue;
            }

            var userResult = User.Create(emailVo, DevSeedPasswordHash, profileResult.Value);
            if (userResult.IsFailure)
            {
                logger.LogWarning("Demo user {Email} skipped: {Message}", email, userResult.Error.Message);
                continue;
            }

            var assign = userResult.Value.AssignRole(role.Id);
            if (assign.IsFailure)
            {
                throw new InvalidOperationException(
                    $"Failed to assign role {roleName} to demo user {email}: {assign.Error.Message}");
            }

            context.Users.Add(userResult.Value);
            await context.SaveChangesAsync();
            logger.LogInformation("Seeded demo user {Email} with role {RoleName}.", email, roleName);
        }
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
