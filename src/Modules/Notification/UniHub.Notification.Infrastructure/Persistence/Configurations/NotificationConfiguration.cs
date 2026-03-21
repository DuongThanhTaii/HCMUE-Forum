using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using UniHub.Notification.Domain.Notifications;
using UniHub.Notification.Domain.NotificationTemplates;

namespace UniHub.Notification.Infrastructure.Persistence.Configurations;

public class NotificationConfiguration : IEntityTypeConfiguration<Domain.Notifications.Notification>
{
    public void Configure(EntityTypeBuilder<Domain.Notifications.Notification> builder)
    {
        builder.ToTable("notifications", "notification");

        builder.HasKey(n => n.Id);
        builder.Property(n => n.Id)
            .HasConversion(
                id => id.Value,
                value => NotificationId.Create(value))
            .HasColumnName("id");

        // Simple properties
        builder.Property(n => n.RecipientId)
            .HasColumnName("recipient_id")
            .IsRequired();

        // Nullable strongly-typed foreign key: TemplateId
        builder.Property(n => n.TemplateId)
            .HasConversion(
                id => id!.Value,
                value => NotificationTemplateId.Create(value))
            .HasColumnName("template_id");

        builder.Property(n => n.Channel)
            .HasColumnName("channel")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.Status)
            .HasColumnName("status")
            .HasConversion<int>()
            .IsRequired();

        builder.Property(n => n.CreatedAt)
            .HasColumnName("created_at")
            .IsRequired();

        builder.Property(n => n.SentAt)
            .HasColumnName("sent_at");

        builder.Property(n => n.ReadAt)
            .HasColumnName("read_at");

        builder.Property(n => n.DismissedAt)
            .HasColumnName("dismissed_at");

        builder.Property(n => n.FailureReason)
            .HasColumnName("failure_reason")
            .HasMaxLength(500);

        builder.Property(n => n.SendAttempts)
            .HasColumnName("send_attempts")
            .HasDefaultValue(0);

        // Owned: NotificationContent
        builder.OwnsOne(n => n.Content, content =>
        {
            content.Property(c => c.Subject)
                .HasColumnName("content_subject")
                .HasMaxLength(200)
                .IsRequired();

            content.Property(c => c.Body)
                .HasColumnName("content_body")
                .HasMaxLength(2000)
                .IsRequired();

            content.Property(c => c.ActionUrl)
                .HasColumnName("content_action_url")
                .HasMaxLength(2000);

            content.Property(c => c.IconUrl)
                .HasColumnName("content_icon_url")
                .HasMaxLength(1000);
        });

        // Owned: NotificationMetadata (with Dictionary backing field)
        builder.OwnsOne(n => n.Metadata, metadata =>
        {
            // Store the _data Dictionary as JSON
            metadata.Property("_data")
                .HasColumnName("metadata")
                .HasColumnType("jsonb");
        });

        // Indexes
        builder.HasIndex(n => n.RecipientId);
        builder.HasIndex(n => n.TemplateId);
        builder.HasIndex(n => n.Channel);
        builder.HasIndex(n => n.Status);
        builder.HasIndex(n => n.CreatedAt);
        builder.HasIndex(n => new { n.RecipientId, n.Status });

        builder.Ignore(n => n.DomainEvents);
    }
}
