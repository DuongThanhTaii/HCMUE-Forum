FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Copy solution and props files
COPY ["UniHub.sln", "."]
COPY ["Directory.Build.props", "."]
COPY ["Directory.Packages.props", "."]

# Copy API project
COPY ["src/UniHub.API/UniHub.API.csproj", "src/UniHub.API/"]

# Copy Shared projects
COPY ["src/Shared/UniHub.Shared.Domain/UniHub.Shared.Domain.csproj", "src/Shared/UniHub.Shared.Domain/"]
COPY ["src/Shared/UniHub.Shared.Application/UniHub.Shared.Application.csproj", "src/Shared/UniHub.Shared.Application/"]
COPY ["src/Shared/UniHub.Shared.Infrastructure/UniHub.Shared.Infrastructure.csproj", "src/Shared/UniHub.Shared.Infrastructure/"]

# Copy Identity module projects
COPY ["src/Modules/Identity/UniHub.Modules.Identity.Domain/UniHub.Modules.Identity.Domain.csproj", "src/Modules/Identity/UniHub.Modules.Identity.Domain/"]
COPY ["src/Modules/Identity/UniHub.Modules.Identity.Application/UniHub.Modules.Identity.Application.csproj", "src/Modules/Identity/UniHub.Modules.Identity.Application/"]
COPY ["src/Modules/Identity/UniHub.Modules.Identity.Infrastructure/UniHub.Modules.Identity.Infrastructure.csproj", "src/Modules/Identity/UniHub.Modules.Identity.Infrastructure/"]
COPY ["src/Modules/Identity/UniHub.Modules.Identity.Presentation/UniHub.Modules.Identity.Presentation.csproj", "src/Modules/Identity/UniHub.Modules.Identity.Presentation/"]

# Copy Forum module projects
COPY ["src/Modules/Forum/UniHub.Modules.Forum.Domain/UniHub.Modules.Forum.Domain.csproj", "src/Modules/Forum/UniHub.Modules.Forum.Domain/"]
COPY ["src/Modules/Forum/UniHub.Modules.Forum.Application/UniHub.Modules.Forum.Application.csproj", "src/Modules/Forum/UniHub.Modules.Forum.Application/"]
COPY ["src/Modules/Forum/UniHub.Modules.Forum.Infrastructure/UniHub.Modules.Forum.Infrastructure.csproj", "src/Modules/Forum/UniHub.Modules.Forum.Infrastructure/"]
COPY ["src/Modules/Forum/UniHub.Modules.Forum.Presentation/UniHub.Modules.Forum.Presentation.csproj", "src/Modules/Forum/UniHub.Modules.Forum.Presentation/"]

# Copy Learning module projects
COPY ["src/Modules/Learning/UniHub.Modules.Learning.Domain/UniHub.Modules.Learning.Domain.csproj", "src/Modules/Learning/UniHub.Modules.Learning.Domain/"]
COPY ["src/Modules/Learning/UniHub.Modules.Learning.Application/UniHub.Modules.Learning.Application.csproj", "src/Modules/Learning/UniHub.Modules.Learning.Application/"]
COPY ["src/Modules/Learning/UniHub.Modules.Learning.Infrastructure/UniHub.Modules.Learning.Infrastructure.csproj", "src/Modules/Learning/UniHub.Modules.Learning.Infrastructure/"]
COPY ["src/Modules/Learning/UniHub.Modules.Learning.Presentation/UniHub.Modules.Learning.Presentation.csproj", "src/Modules/Learning/UniHub.Modules.Learning.Presentation/"]

# Copy Chat module projects
COPY ["src/Modules/Chat/UniHub.Modules.Chat.Domain/UniHub.Modules.Chat.Domain.csproj", "src/Modules/Chat/UniHub.Modules.Chat.Domain/"]
COPY ["src/Modules/Chat/UniHub.Modules.Chat.Application/UniHub.Modules.Chat.Application.csproj", "src/Modules/Chat/UniHub.Modules.Chat.Application/"]
COPY ["src/Modules/Chat/UniHub.Modules.Chat.Infrastructure/UniHub.Modules.Chat.Infrastructure.csproj", "src/Modules/Chat/UniHub.Modules.Chat.Infrastructure/"]
COPY ["src/Modules/Chat/UniHub.Modules.Chat.Presentation/UniHub.Modules.Chat.Presentation.csproj", "src/Modules/Chat/UniHub.Modules.Chat.Presentation/"]

# Copy Career module projects
COPY ["src/Modules/Career/UniHub.Modules.Career.Domain/UniHub.Modules.Career.Domain.csproj", "src/Modules/Career/UniHub.Modules.Career.Domain/"]
COPY ["src/Modules/Career/UniHub.Modules.Career.Application/UniHub.Modules.Career.Application.csproj", "src/Modules/Career/UniHub.Modules.Career.Application/"]
COPY ["src/Modules/Career/UniHub.Modules.Career.Infrastructure/UniHub.Modules.Career.Infrastructure.csproj", "src/Modules/Career/UniHub.Modules.Career.Infrastructure/"]
COPY ["src/Modules/Career/UniHub.Modules.Career.Presentation/UniHub.Modules.Career.Presentation.csproj", "src/Modules/Career/UniHub.Modules.Career.Presentation/"]

# Copy Notification module projects
COPY ["src/Modules/Notification/UniHub.Modules.Notification.Domain/UniHub.Modules.Notification.Domain.csproj", "src/Modules/Notification/UniHub.Modules.Notification.Domain/"]
COPY ["src/Modules/Notification/UniHub.Modules.Notification.Application/UniHub.Modules.Notification.Application.csproj", "src/Modules/Notification/UniHub.Modules.Notification.Application/"]
COPY ["src/Modules/Notification/UniHub.Modules.Notification.Infrastructure/UniHub.Modules.Notification.Infrastructure.csproj", "src/Modules/Notification/UniHub.Modules.Notification.Infrastructure/"]
COPY ["src/Modules/Notification/UniHub.Modules.Notification.Presentation/UniHub.Modules.Notification.Presentation.csproj", "src/Modules/Notification/UniHub.Modules.Notification.Presentation/"]

# Copy AI module projects
COPY ["src/Modules/AI/UniHub.Modules.AI.Domain/UniHub.Modules.AI.Domain.csproj", "src/Modules/AI/UniHub.Modules.AI.Domain/"]
COPY ["src/Modules/AI/UniHub.Modules.AI.Application/UniHub.Modules.AI.Application.csproj", "src/Modules/AI/UniHub.Modules.AI.Application/"]
COPY ["src/Modules/AI/UniHub.Modules.AI.Infrastructure/UniHub.Modules.AI.Infrastructure.csproj", "src/Modules/AI/UniHub.Modules.AI.Infrastructure/"]
COPY ["src/Modules/AI/UniHub.Modules.AI.Presentation/UniHub.Modules.AI.Presentation.csproj", "src/Modules/AI/UniHub.Modules.AI.Presentation/"]

# Restore dependencies
RUN dotnet restore "src/UniHub.API/UniHub.API.csproj"

# Copy all source files
COPY . .

# Build
WORKDIR "/src/src/UniHub.API"
RUN dotnet build "UniHub.API.csproj" -c Release -o /app/build

# Publish
FROM build AS publish
RUN dotnet publish "UniHub.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

# Final stage
FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "UniHub.API.dll"]
