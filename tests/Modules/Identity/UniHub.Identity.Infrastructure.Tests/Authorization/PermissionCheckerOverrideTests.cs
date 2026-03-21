using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using UniHub.Identity.Application.Abstractions;
using UniHub.Identity.Domain.Authorization;
using UniHub.Identity.Domain.Permissions;
using UniHub.Identity.Domain.Roles;
using UniHub.Identity.Domain.Users;
using UniHub.Identity.Domain.Users.ValueObjects;
using UniHub.Identity.Infrastructure;

namespace UniHub.Identity.Infrastructure.Tests.Authorization;

public class PermissionCheckerOverrideTests
{
    private static ServiceProvider BuildProvider()
    {
        var settings = new Dictionary<string, string?>
        {
            ["Jwt:SecretKey"] = "ThisIsATestSecretKeyForPermissionCheckerOverrideTests_1234567890",
            ["Jwt:Issuer"] = "UniHub.Tests",
            ["Jwt:Audience"] = "UniHub.Tests.Client",
            ["Jwt:AccessTokenExpiryMinutes"] = "15",
            ["Jwt:RefreshTokenExpiryDays"] = "7"
        };

        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(settings)
            .Build();

        var services = new ServiceCollection();
        services.AddIdentityInfrastructure(configuration);

        return services.BuildServiceProvider();
    }

    private static async Task<User> CreateUserAsync(IUserRepository userRepository, string emailAddress)
    {
        var email = Email.Create(emailAddress).Value;
        var profile = UserProfile.Create("Test", "User").Value;
        var user = User.Create(email, "hashed-password", profile).Value;

        await userRepository.AddAsync(user);
        return user;
    }

    [Fact]
    public async Task HasPermissionAsync_WhenRoleAllowsAndNoOverrides_ShouldReturnTrue()
    {
        using var provider = BuildProvider();
        using var scope = provider.CreateScope();

        var checker = scope.ServiceProvider.GetRequiredService<IPermissionChecker>();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var roleRepository = scope.ServiceProvider.GetRequiredService<IRoleRepository>();
        var permissionRepository = scope.ServiceProvider.GetRequiredService<IPermissionRepository>();

        var user = await CreateUserAsync(userRepository, $"role-allow-{Guid.NewGuid():N}@example.com");
        var role = Role.Create($"TestRole-{Guid.NewGuid():N}", "Role for permission checker tests").Value;
        var permission = await permissionRepository.GetByCodeAsync("forum.post.create");

        permission.Should().NotBeNull();

        await roleRepository.AddAsync(role);

        user.AssignRole(role.Id).IsSuccess.Should().BeTrue();
        role.AssignPermission(permission!.Id, PermissionScope.Global()).IsSuccess.Should().BeTrue();

        var result = await checker.HasPermissionAsync(user.Id, "forum.post.create");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasPermissionAsync_WhenUserDenyOverrideExists_ShouldReturnFalse()
    {
        using var provider = BuildProvider();
        using var scope = provider.CreateScope();

        var checker = scope.ServiceProvider.GetRequiredService<IPermissionChecker>();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var roleRepository = scope.ServiceProvider.GetRequiredService<IRoleRepository>();
        var permissionRepository = scope.ServiceProvider.GetRequiredService<IPermissionRepository>();
        var userOverrideRepository = scope.ServiceProvider.GetRequiredService<IUserPermissionOverrideRepository>();

        var user = await CreateUserAsync(userRepository, $"user-deny-{Guid.NewGuid():N}@example.com");
        var role = Role.Create($"TestRole-{Guid.NewGuid():N}", "Role for permission checker tests").Value;
        var permission = await permissionRepository.GetByCodeAsync("forum.post.create");

        permission.Should().NotBeNull();

        await roleRepository.AddAsync(role);

        user.AssignRole(role.Id).IsSuccess.Should().BeTrue();
        role.AssignPermission(permission!.Id, PermissionScope.Global()).IsSuccess.Should().BeTrue();

        var denyOverride = UserPermissionOverride.Create(
            user.Id,
            permission.Id,
            PermissionScope.Global(),
            PermissionEffect.Deny,
            "Block this permission").Value;

        await userOverrideRepository.AddAsync(denyOverride);

        var result = await checker.HasPermissionAsync(user.Id, "forum.post.create");

        result.Should().BeFalse();
    }

    [Fact]
    public async Task HasPermissionAsync_WhenGroupAllowOverrideExists_ShouldReturnTrue()
    {
        using var provider = BuildProvider();
        using var scope = provider.CreateScope();

        var checker = scope.ServiceProvider.GetRequiredService<IPermissionChecker>();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var permissionRepository = scope.ServiceProvider.GetRequiredService<IPermissionRepository>();
        var userGroupRepository = scope.ServiceProvider.GetRequiredService<IUserGroupRepository>();
        var groupOverrideRepository = scope.ServiceProvider.GetRequiredService<IGroupPermissionOverrideRepository>();

        var user = await CreateUserAsync(userRepository, $"group-allow-{Guid.NewGuid():N}@example.com");
        var permission = await permissionRepository.GetByCodeAsync("forum.post.create");
        permission.Should().NotBeNull();

        var group = UserGroup.Create($"group-{Guid.NewGuid():N}").Value;
        group.AddMember(user.Id).IsSuccess.Should().BeTrue();
        await userGroupRepository.AddAsync(group);

        var allowOverride = GroupPermissionOverride.Create(
            group.Id,
            permission!.Id,
            PermissionScope.Global(),
            PermissionEffect.Allow,
            "Group can create post").Value;

        await groupOverrideRepository.AddAsync(allowOverride);

        var result = await checker.HasPermissionAsync(user.Id, "forum.post.create");

        result.Should().BeTrue();
    }

    [Fact]
    public async Task HasPermissionAsync_WhenUserAllowAndGroupDenyExist_ShouldReturnTrue()
    {
        using var provider = BuildProvider();
        using var scope = provider.CreateScope();

        var checker = scope.ServiceProvider.GetRequiredService<IPermissionChecker>();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var permissionRepository = scope.ServiceProvider.GetRequiredService<IPermissionRepository>();
        var userGroupRepository = scope.ServiceProvider.GetRequiredService<IUserGroupRepository>();
        var userOverrideRepository = scope.ServiceProvider.GetRequiredService<IUserPermissionOverrideRepository>();
        var groupOverrideRepository = scope.ServiceProvider.GetRequiredService<IGroupPermissionOverrideRepository>();

        var user = await CreateUserAsync(userRepository, $"user-allow-group-deny-{Guid.NewGuid():N}@example.com");
        var permission = await permissionRepository.GetByCodeAsync("forum.post.create");
        permission.Should().NotBeNull();

        var group = UserGroup.Create($"group-{Guid.NewGuid():N}").Value;
        group.AddMember(user.Id).IsSuccess.Should().BeTrue();
        await userGroupRepository.AddAsync(group);

        var groupDeny = GroupPermissionOverride.Create(
            group.Id,
            permission!.Id,
            PermissionScope.Global(),
            PermissionEffect.Deny,
            "Group denied").Value;

        await groupOverrideRepository.AddAsync(groupDeny);

        var userAllow = UserPermissionOverride.Create(
            user.Id,
            permission.Id,
            PermissionScope.Global(),
            PermissionEffect.Allow,
            "User explicitly allowed").Value;

        await userOverrideRepository.AddAsync(userAllow);

        var result = await checker.HasPermissionAsync(user.Id, "forum.post.create");

        result.Should().BeTrue();
    }
}
