# Docker Compose - UniHub Development Environment

## 🐳 Services

| Service    | Image             | Port  | Credentials                  |
|------------|-------------------|-------|------------------------------|
| PostgreSQL | postgres:16-alpine | 5432  | unihub / unihub_dev_2026    |
| MongoDB    | mongo:7-jammy     | 27017 | unihub / unihub_dev_2026    |
| Redis      | redis:7-alpine    | 6379  | Password: unihub_dev_2026   |

## 🚀 Quick Start

### Start all services

```bash
docker-compose up -d
```

### Stop all services

```bash
docker-compose down
```

### Stop and remove volumes (clean slate)

```bash
docker-compose down -v
```

### View logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f postgres
docker-compose logs -f mongodb
docker-compose logs -f redis
```

### Check service health

```bash
docker-compose ps
```

## 🔌 Connection Strings

### PostgreSQL

```
Host: localhost
Port: 5432
Database: unihub
Username: unihub
Password: unihub_dev_2026

Connection String:
Host=localhost;Port=5432;Database=unihub;Username=unihub;Password=unihub_dev_2026
```

### MongoDB

```
Host: localhost
Port: 27017
Database: unihub
Username: unihub
Password: unihub_dev_2026

Connection String:
mongodb://unihub:unihub_dev_2026@localhost:27017/unihub?authSource=admin
```

### Redis

```
Host: localhost
Port: 6379
Password: unihub_dev_2026

Connection String:
localhost:6379,password=unihub_dev_2026
```

## 📦 Data Persistence

Data is persisted in Docker volumes:
- `postgres_data` - PostgreSQL database
- `mongo_data` - MongoDB database
- `mongo_config` - MongoDB configuration
- `redis_data` - Redis data

## 🔧 Development Override

The `docker-compose.override.yml` file is automatically applied in development and includes:
- Verbose logging for debugging
- Trust authentication for PostgreSQL (easier local development)
- Debug mode for Redis

## 🧪 Test Connection

### PostgreSQL

```bash
docker exec -it unihub-postgres psql -U unihub -d unihub
```

### MongoDB

```bash
docker exec -it unihub-mongodb mongosh -u unihub -p unihub_dev_2026 --authenticationDatabase admin
```

### Redis

```bash
docker exec -it unihub-redis redis-cli -a unihub_dev_2026
```

## 🛑 Troubleshooting

### Port already in use

If ports are already in use, you can change them in `docker-compose.override.yml`:

```yaml
services:
  postgres:
    ports:
      - "5433:5432"  # Change host port
```

### Reset everything

```bash
docker-compose down -v
docker-compose up -d
```

### View resource usage

```bash
docker stats
```

## 📝 Notes

- All containers have health checks configured
- Containers will restart automatically unless stopped manually
- Network `unihub-network` is created for inter-container communication
- For production, use separate docker-compose files with proper secrets management
