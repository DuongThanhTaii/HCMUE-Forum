using System.Reflection;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;

namespace UniHub.Infrastructure.Persistence;

/// <summary>
/// Design-time factory for creating ApplicationDbContext instances.
/// Used by EF Core tools for migrations.
/// </summary>
public class ApplicationDbContextFactory : IDesignTimeDbContextFactory<ApplicationDbContext>
{
    public ApplicationDbContext CreateDbContext(string[] args)
    {
        // Force-load all module Infrastructure assemblies so OnModelCreating
        // can discover entity configurations via assembly scanning
        LoadModuleAssemblies();

        var optionsBuilder = new DbContextOptionsBuilder<ApplicationDbContext>();
        
        // Use PostgreSQL with a default connection string for design-time
        optionsBuilder.UseNpgsql(
            "Host=localhost;Port=5432;Database=unihub_db;Username=postgres;Password=postgres",
            npgsqlOptions =>
            {
                npgsqlOptions.MigrationsAssembly(typeof(ApplicationDbContext).Assembly.FullName);
            });

        return new ApplicationDbContext(optionsBuilder.Options);
    }

    /// <summary>
    /// Loads all module Infrastructure assemblies to ensure entity configurations are discovered.
    /// At design time, assemblies may not be loaded automatically by AppDomain.
    /// </summary>
    private static void LoadModuleAssemblies()
    {
        var baseDir = AppDomain.CurrentDomain.BaseDirectory;
        var assemblyFiles = Directory.GetFiles(baseDir, "UniHub.*.Infrastructure.dll");

        foreach (var file in assemblyFiles)
        {
            try
            {
                Assembly.LoadFrom(file);
            }
            catch
            {
                // Ignore assemblies that fail to load
            }
        }
    }
}
