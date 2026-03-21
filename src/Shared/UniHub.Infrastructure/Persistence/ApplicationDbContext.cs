using Microsoft.EntityFrameworkCore;
using UniHub.SharedKernel.Domain;
// Identity
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Domain.Permissions;
using UniHub.Identity.Domain.Tokens;
// Forum
using UniHub.Forum.Domain.Posts;
using UniHub.Forum.Domain.Comments;
using UniHub.Forum.Domain.Categories;
using UniHub.Forum.Domain.Tags;
using UniHub.Forum.Domain.Reports;
using UniHub.Forum.Domain.Bookmarks;
// Learning
using UniHub.Learning.Domain.Courses;
using UniHub.Learning.Domain.Documents;
using UniHub.Learning.Domain.Faculties;
// Chat
using UniHub.Chat.Domain.Conversations;
using UniHub.Chat.Domain.Messages;
using UniHub.Chat.Domain.Channels;
// Career
using UniHub.Career.Domain.Companies;
using UniHub.Career.Domain.JobPostings;
using UniHub.Career.Domain.Applications;
using UniHub.Career.Domain.Recruiters;
// Notification
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationPreferences;
using UniHub.Notification.Domain.NotificationTemplates;

namespace UniHub.Infrastructure.Persistence;

/// <summary>
/// Main database context for the application using PostgreSQL.
/// </summary>
public class ApplicationDbContext : DbContext
{
    /// <summary>
    /// Initializes a new instance of the <see cref="ApplicationDbContext"/> class.
    /// </summary>
    /// <param name="options">The options to configure the context.</param>
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    #region Identity Module DbSets
    public DbSet<User> Users => Set<User>();
    public DbSet<UserRole> UserRoles => Set<UserRole>();
    public DbSet<Role> Roles => Set<Role>();
    public DbSet<RolePermission> RolePermissions => Set<RolePermission>();
    public DbSet<Permission> Permissions => Set<Permission>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    public DbSet<PasswordResetToken> PasswordResetTokens => Set<PasswordResetToken>();
    #endregion

    #region Forum Module DbSets
    public DbSet<Post> Posts => Set<Post>();
    public DbSet<Comment> Comments => Set<Comment>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Tag> Tags => Set<Tag>();
    public DbSet<PostTag> PostTags => Set<PostTag>();
    public DbSet<Report> Reports => Set<Report>();
    public DbSet<Bookmark> Bookmarks => Set<Bookmark>();
    #endregion

    #region Learning Module DbSets
    public DbSet<Course> Courses => Set<Course>();
    public DbSet<Document> Documents => Set<Document>();
    public DbSet<Faculty> Faculties => Set<Faculty>();
    #endregion

    #region Chat Module DbSets
    public DbSet<Conversation> Conversations => Set<Conversation>();
    public DbSet<Message> Messages => Set<Message>();
    public DbSet<Channel> Channels => Set<Channel>();
    #endregion

    #region Career Module DbSets
    public DbSet<Company> Companies => Set<Company>();
    public DbSet<JobPosting> JobPostings => Set<JobPosting>();
    public DbSet<Application> Applications => Set<Application>();
    public DbSet<Recruiter> Recruiters => Set<Recruiter>();
    #endregion

    #region Notification Module DbSets
    public DbSet<UniHub.Notification.Domain.Notifications.Notification> Notifications => Set<UniHub.Notification.Domain.Notifications.Notification>();
    public DbSet<NotificationPreference> NotificationPreferences => Set<NotificationPreference>();
    public DbSet<NotificationTemplate> NotificationTemplates => Set<NotificationTemplate>();
    #endregion

    /// <summary>
    /// Configures the model for this context.
    /// </summary>
    /// <param name="modelBuilder">The builder being used to construct the model for this context.</param>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Apply entity configurations from all loaded assemblies that contain entity type configurations
        // This will automatically discover and apply configurations from all module Infrastructure assemblies
        var assemblies = AppDomain.CurrentDomain.GetAssemblies()
            .Where(a => a.FullName != null && 
                       (a.FullName.Contains("UniHub") && a.FullName.Contains("Infrastructure")))
            .ToList();

        foreach (var assembly in assemblies)
        {
            modelBuilder.ApplyConfigurationsFromAssembly(assembly);
        }
    }

    /// <summary>
    /// Saves all changes made in this context to the database and dispatches domain events.
    /// </summary>
    /// <param name="cancellationToken">A cancellation token to observe while waiting for the task to complete.</param>
    /// <returns>The number of state entries written to the database.</returns>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        // The interceptors will handle:
        // - Setting audit fields (AuditableEntityInterceptor)
        // - Collecting domain events (DomainEventInterceptor)
        return await base.SaveChangesAsync(cancellationToken);
    }
}
