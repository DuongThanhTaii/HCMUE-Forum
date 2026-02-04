# 🔐 Environment Variables

> Configuration guide for UniHub environment variables

---

## 📝 Overview

This document lists all environment variables required for UniHub backend API.

## 🗄️ Database Connections

### PostgreSQL (Neon.tech)

```bash
CONNECTIONSTRINGS__POSTGRESQL="Host=<neon-host>;Port=5432;Database=<db-name>;Username=<username>;Password=<password>;SSL Mode=Require"
```

**Example:**
```bash
CONNECTIONSTRINGS__POSTGRESQL="Host=ep-cool-grass-123456.us-east-2.aws.neon.tech;Port=5432;Database=unihub_prod;Username=unihub_user;Password=your_secure_password;SSL Mode=Require"
```

**Local Development (appsettings.Development.json):**
```bash
Host=localhost;Port=5432;Database=unihub;Username=unihub;Password=unihub_dev
```

### MongoDB (MongoDB Atlas)

```bash
CONNECTIONSTRINGS__MONGODB="mongodb+srv://<username>:<password>@<cluster-url>/<database>?retryWrites=true&w=majority"
```

**Example:**
```bash
CONNECTIONSTRINGS__MONGODB="mongodb+srv://unihub_user:your_secure_password@cluster0.abc123.mongodb.net/unihub_prod?retryWrites=true&w=majority"
```

**Local Development (appsettings.Development.json):**
```bash
mongodb://unihub:unihub_dev@localhost:27017
```

### Redis (Upstash)

```bash
CONNECTIONSTRINGS__REDIS="<upstash-redis-url>"
```

**Example:**
```bash
CONNECTIONSTRINGS__REDIS="rediss://:your_token@flying-bat-12345.upstash.io:6379"
```

**Local Development (appsettings.Development.json):**
```bash
localhost:6379
```

---

## 🚀 Deployment Platforms

### Railway

Set environment variables in Railway dashboard:

1. Go to your project
2. Click on "Variables" tab
3. Add the following variables:
   - `CONNECTIONSTRINGS__POSTGRESQL`
   - `CONNECTIONSTRINGS__MONGODB`
   - `CONNECTIONSTRINGS__REDIS`
   - `ASPNETCORE_ENVIRONMENT=Production`

### Vercel (Frontend)

```bash
NEXT_PUBLIC_API_URL=https://your-api-url.railway.app
```

---

## 🔒 User Secrets (Local Development)

For sensitive data during local development, use .NET User Secrets:

```bash
# Initialize user secrets
cd src/UniHub.API
dotnet user-secrets init

# Set connection strings
dotnet user-secrets set "ConnectionStrings:PostgreSQL" "your-local-connection"
dotnet user-secrets set "ConnectionStrings:MongoDB" "your-local-connection"
dotnet user-secrets set "ConnectionStrings:Redis" "your-local-connection"

# List all secrets
dotnet user-secrets list

# Clear all secrets
dotnet user-secrets clear
```

**Note:** User secrets override values in `appsettings.Development.json`

---

## ⚠️ Security Best Practices

1. **Never commit secrets** to Git
2. **Use different credentials** for each environment
3. **Rotate credentials** regularly
4. **Use strong passwords** (min 16 characters, mixed case, numbers, symbols)
5. **Enable 2FA** on cloud provider accounts
6. **Restrict database access** by IP when possible
7. **Use SSL/TLS** for all connections

---

## 📚 References

- [Neon.tech Connection Strings](https://neon.tech/docs/connect/connect-from-any-app)
- [MongoDB Atlas Connection Strings](https://www.mongodb.com/docs/atlas/driver-connection/)
- [Upstash Redis Connection](https://upstash.com/docs/redis/overall/getstarted)
- [.NET Configuration](https://learn.microsoft.com/en-us/aspnet/core/fundamentals/configuration/)
- [.NET User Secrets](https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets)

---

## 🧪 Testing Connections

Test connection strings with the health check endpoint:

```bash
# Local
curl http://localhost:5000/health/connections

# Production
curl https://your-api-url.railway.app/health/connections
```

Expected response:
```json
{
  "status": "Healthy",
  "timestamp": "2026-02-15T10:30:00Z",
  "connectionsConfigured": {
    "postgreSQL": true,
    "mongoDB": true,
    "redis": true
  }
}
```
