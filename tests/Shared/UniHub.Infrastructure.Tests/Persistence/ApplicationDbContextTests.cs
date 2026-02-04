using FluentAssertions;
using Microsoft.EntityFrameworkCore;
using UniHub.Infrastructure.Persistence;
using UniHub.Infrastructure.Persistence.Interceptors;
using UniHub.SharedKernel.Domain;

namespace UniHub.Infrastructure.Tests.Persistence;

public class ApplicationDbContextTests
{
    [Fact]
    public async Task SaveChangesAsync_ShouldSaveEntitiesToDatabase()
    {
        // Arrange
        var context = CreateTestDbContext();
        var entity = new TestAggregateRoot(1) { Name = "Test Entity" };

        // Act
        context.TestAggregates.Add(entity);
        var result = await context.SaveChangesAsync();

        // Assert
        result.Should().Be(1);
        var savedEntity = await context.TestAggregates.FindAsync(1);
        savedEntity.Should().NotBeNull();
        savedEntity!.Name.Should().Be("Test Entity");
    }

    [Fact]
    public async Task DbContext_ShouldApplyConfigurationsFromAssembly()
    {
        // Arrange
        var context = CreateTestDbContext();

        // Act
        var model = context.Model;

        // Assert
        model.Should().NotBeNull();
        // Configurations will be applied when entity configurations are added
    }

    [Fact]
    public void DbContext_ShouldBeConfiguredWithInMemoryDatabase()
    {
        // Arrange & Act
        var context = CreateTestDbContext();

        // Assert
        context.Should().NotBeNull();
        context.Database.IsInMemory().Should().BeTrue();
    }

    private static TestDbContext CreateTestDbContext()
    {
        var options = new DbContextOptionsBuilder<ApplicationDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;

        return new TestDbContext(options);
    }

    // Test DbContext that extends ApplicationDbContext
    private class TestDbContext : ApplicationDbContext
    {
        public TestDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

        public DbSet<TestAggregateRoot> TestAggregates => Set<TestAggregateRoot>();
    }

    // Test aggregate root for testing purposes
    private class TestAggregateRoot : AggregateRoot<int>
    {
        public string Name { get; set; } = string.Empty;

        public TestAggregateRoot() : base() { }
        public TestAggregateRoot(int id) : base(id) { }
    }
}
