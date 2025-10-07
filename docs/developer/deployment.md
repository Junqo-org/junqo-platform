---
title: Deployment Guide
nav_order: 8
---

<!-- omit in toc -->
## Table of Contents

- [Overview](#overview)
- [System Requirements](#system-requirements)
  - [Minimum System Requirements](#minimum-system-requirements)
  - [Software Requirements](#software-requirements)
    - [Verify Installation](#verify-installation)
- [Project Architecture](#project-architecture)
- [Development Deployment](#development-deployment)
  - [Configuration Files](#configuration-files)
  - [Running the Development Environment](#running-the-development-environment)
  - [Development Features](#development-features)
  - [Accessing Services](#accessing-services)
  - [Development Workflow](#development-workflow)
- [Production Deployment](#production-deployment)
  - [Production Prerequisites](#production-prerequisites)
  - [Server Setup](#server-setup)
  - [SSL Certificates Configuration](#ssl-certificates-configuration)
  - [Production Configuration](#production-configuration)
  - [Deploying to Production](#deploying-to-production)
  - [Production Features](#production-features)
  - [Monitoring and Logging](#monitoring-and-logging)
- [Environment Configuration](#environment-configuration)
  - [Global Environment Variables](#global-environment-variables)
  - [Backend Configuration](#backend-configuration)
  - [Frontend Configuration](#frontend-configuration)
  - [Database Configuration](#database-configuration)
- [Security Considerations](#security-considerations)
  - [Production Security Checklist](#production-security-checklist)
  - [File Permissions](#file-permissions)
  - [Network Security](#network-security)
- [Maintenance and Updates](#maintenance-and-updates)
  - [Regular Maintenance Tasks](#regular-maintenance-tasks)
  - [Backup Strategy](#backup-strategy)
  - [Update Procedure](#update-procedure)
- [Troubleshooting](#troubleshooting)
  - [Common Issues and Solutions](#common-issues-and-solutions)
  - [Performance Issues](#performance-issues)
  - [Log Analysis](#log-analysis)

## Overview

The **Junqo-platform** is a multi-platform solution designed to help young people find internships and work-study programs. The platform consists of:

- **Frontend**: A Flutter web application providing the user interface
- **Backend**: A NestJS REST API with WebSocket support
- **Database**: PostgreSQL database for data persistence
- **Reverse Proxy**: Nginx for routing and SSL termination
- **Monitoring Stack**: Prometheus, Grafana, and Loki for observability
- **Database Management**: Adminer for database administration

## System Requirements

### Minimum System Requirements

- **CPU**: 2 cores
- **RAM**: 4GB (8GB recommended)
- **Storage**: 10GB free space
- **Network**: Internet connection for package downloads and SSL certificate generation

### Software Requirements

- [Git](https://git-scm.com/) (latest version)
- [Docker](https://www.docker.com/) (v20.10.7 or higher)
- [Docker Compose](https://docs.docker.com/compose/) (v1.29.2 or higher)
- [Python 3](https://www.python.org/) (v3.6 or higher) - for configuration management

#### Verify Installation

```bash
# Check Git installation
git --version

# Check Docker installation
docker --version

# Check Docker Compose installation
docker compose --version
```

## Project Architecture

The Junqo platform uses a microservices architecture deployed with Docker Compose:

```text
┌─────────────────────────────────────────────────────────────┐
│                      Nginx Reverse Proxy                    │
│                    (Port 80/443 - HTTPS)                    │
└─────────────────────┬─────────────────────┬─────────────────┘
                      │                     │
            ┌─────────▼──────────┐ ┌────────▼───────┐
            │   Flutter Frontend │ │ NestJS Backend │
            │    (Port 80)       │ │  (Port 4200)   │
            └────────────────────┘ └────────┬───────┘
                                            │
                                  ┌─────────▼───────────┐
                                  │ PostgreSQL Database │
                                  │    (Port 5432)      │
                                  └─────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    Monitoring Stack                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐            │
│  │  Prometheus │ │   Grafana   │ │    Loki     │            │
│  │             │ │             │ │             │            │
│  └─────────────┘ └─────────────┘ └─────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

## Development Deployment

Development deployment provides a local environment for development with hot-reloading, debugging tools, and direct access to services.

1. **Clone the Repository**

   ```bash
   # Clone the repository
   git clone git@github.com:Junqo-org/junqo-platform.git

   # Navigate to the project directory
   cd junqo-platform
   ```

### Configuration Files

1. **Secret Configuration Files**

   Create two secret files at the project root:

   a. `db_password.conf` for the database password:

   ```bash
   # Create database password file
   echo "your_secure_db_password" > db_password.conf
   ```

   b. `grafana_password.conf` for the Grafana admin password:

   ```bash
   # Create Grafana admin password file
   echo "your_secure_grafana_password" > grafana_password.conf
   ```

   These files contain sensitive credentials and should never be committed to version control.
   You can customize their locations using the environment variables `DATABASE_PASSWORD_FILE` and `GRAFANA_PASSWORD_FILE` respectively.

2. **Backend Configuration**

   ```bash
   # Navigate to backend directory
   cd junqo_back

   # Copy example environment file
   cp exemple.env .env
   ```

   Edit `junqo_back/.env` with your preferred text editor:

   ```env
   # Database Configuration
   # DATABASE_HOST=localhost
   # DATABASE_PORT=5432
   # DATABASE_NAME=junqo
   # DATABASE_USER=junqo
   # DATABASE_PASSWORD=your_secure_db_password
   DATABASE_PASSWORD_FILE=/run/secrets/db_password

   # Security Configuration
   JWT_SECRET=your_jwt_secret_minimum_32_characters_long

   # CORS Configuration (for development, allow all origins)
   # CORS_ORIGINS=http://localhost:80

   # OpenAI Configuration (required for AI features)
   OPENAI_API_KEY=your_openai_api_key

   # Environment
   NODE_ENV=development
   ```

   More backend details (envs, migrations, start commands) are in the [Backend documentation](./backend.md).

3. **Frontend Configuration**

   ```bash
   # Navigate to frontend config directory
   cd ../junqo_front/config

   # Copy example environment file
   cp exemple.env .env
   ```

   Edit `junqo_front/config/.env`:

   ```env
   # API URL for development (pointing to local backend)
   API_URL=/api/v1
   ```

   If you are running the backend on a different host or port, adjust the `API_URL` accordingly (e.g., `http://localhost:4200/api/v1`).

   For platform-specific build and run instructions (Flutter setup, pub packages, etc.) see the [Frontend documentation](./frontend.md).

### Running the Development Environment

1. **Start the Development Stack**

   ```bash
   # Return to project root

   # Start development environment with file watching
   docker compose -f docker-compose.dev.yaml up -d --watch

   # Alternative: Start with build flag to force rebuild
   docker compose -f docker-compose.dev.yaml up -d --watch --build
   ```

   The `-f` flag specifies the development Docker Compose file.
   The `-d` flag runs the containers in detached mode (in the background) so you can continue using the terminal.
   The `--watch` flag enables automatic reloading when you make changes to the source code.
   The `--build` flag forces a rebuild of the containers.

2. **Verify Services are Running**

   ```bash
   # Check running containers
   docker compose -f docker-compose.dev.yaml ps

   # Check logs for all services
   docker compose -f docker-compose.dev.yaml logs

   # Check logs for specific service
   docker compose -f docker-compose.dev.yaml logs back
   ```

### Development Features

The development environment includes several features that are not available in production:

- **Hot Reloading**: Automatically reloads the application when source code changes
- **Direct Port Access**: Services are accessible on local ports
- **Adminer**: Database management interface
- **Development Logging**: Enhanced logging for debugging
- **File Watching**: Automatic container rebuilding on file changes

> The Compose `--watch` behavior and CI differences are discussed in the [CI/CD documentation](./ci_cd.md).

### Accessing Services

Once the development environment is running, you can access:

| Service            | URL                         | Description                   |
| ------------------ | --------------------------- | ----------------------------- |
| Frontend           | <http://localhost:80>       | Main application interface    |
| Backend API        | <http://localhost:4200>     | REST API endpoints            |
| API Documentation  | <http://localhost:4200/api> | Swagger/OpenAPI documentation |
| Adminer (Database) | <http://localhost:3000>     | Database management interface |

**Adminer Login Details:**

- Server: `db`
- Username: `junqo` (or your configured `DATABASE_USER`)
- Password: Contents of `db_password.conf`
- Database: `junqo` (or your configured `DATABASE_NAME`)

### Development Workflow

1. **Making Changes**
   - Frontend changes: Edit files in `junqo_front/` - changes will trigger automatic rebuilds
   - Backend changes: Edit files in `junqo_back/` - NestJS will automatically reload
   - Configuration changes: Edit `.env` files and restart specific services

2. **Viewing Logs**

   ```bash
   # Real-time logs for all services
   docker compose -f docker-compose.dev.yaml logs -f

   # Logs for specific service
   docker compose -f docker-compose.dev.yaml logs -f back
   ```

3. **Stopping the Environment**

   ```bash
   # Stop all services
   docker compose -f docker-compose.dev.yaml down

   # Stop and remove volumes (clears database data)
   docker compose -f docker-compose.dev.yaml down -v
   ```

## Production Deployment

Production deployment is designed for running the platform in a live environment with proper security, monitoring, and performance optimizations.

### Production Prerequisites

1. **Server Requirements**
   - Linux server (Ubuntu 20.04+ recommended)
   - Public IP address
   - Domain name pointing to the server
   - Sudo access

### Server Setup

1. **Clone the Repository**

   ```bash
   # Create application directory
   sudo mkdir -p /opt/junqo
   sudo chown $USER:$USER /opt/junqo

   # Clone repository
   cd /opt/junqo
   git clone git@github.com:Junqo-org/junqo-platform.git .
   ```

### SSL Certificates Configuration

For production deployment, SSL certificates are required for HTTPS.
For detailed instructions, visit the [official Certbot documentation](https://certbot.eff.org/).

1. **Install Certbot**

   ```bash
   # Install Certbot and Nginx plugin
   sudo apt update
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Obtain SSL Certificates**

   ```bash
   # Replace yourdomain.com with your actual domain
   sudo certbot --nginx -d yourdomain.com
   ```

   Follow the prompts to:
   - Enter your email address
   - Accept the terms of service
   - Choose whether to redirect HTTP traffic to HTTPS

   Certbot will automatically:
   - Obtain the certificate
   - Configure Nginx
   - Set up auto-renewal

3. **Verify Auto-Renewal**

   ```bash
   # Check that auto-renewal timer is active
   sudo systemctl status certbot.timer

   # Test renewal process
   sudo certbot renew --dry-run
   ```

   Certificates will be automatically renewed before expiry.

### Production Configuration

1. **Create Secret Files**

   ```bash
   # Create secure database password
   openssl rand -base64 32 > db_password.conf

   # Create secure Grafana password
   openssl rand -base64 32 > grafana_password.conf

   # Secure the files
   chmod 600 db_password.conf grafana_password.conf
   ```

2. **Backend Production Configuration**

   Create `junqo_back/.env`:

   ```env
   # Database Configuration
   DATABASE_PASSWORD_FILE=/run/secrets/db_password

   # Security Configuration - Generate with: `openssl rand -base64 32`
   JWT_SECRET=your_production_jwt_secret_minimum_32_characters

   # CORS Configuration (restrict to your domain)
   CORS_ORIGINS=https://yourdomain.com

   # OpenAI Configuration
   OPENAI_API_KEY=your_production_openai_api_key

   # Environment
   NODE_ENV=production
   ```

3. **Frontend Production Configuration**

   Create `junqo_front/config/.env`:

   ```env
   # API URL for production
   API_URL=https://yourdomain.com/api/v1
   ```

4. **Global Environment Variables**

   Create `.env` at project root:

   ```env
   # SSL Certificate path
   SSL_CERTS_PATH=/etc/letsencrypt

   # Database configuration
   DATABASE_NAME=junqo
   DATABASE_USER=junqo
   DATABASE_SHM_SIZE=256mb

   # Flutter version
   FLUTTER_VERSION=3.35.3
   ```

### Deploying to Production

1. **Start Production Environment**

   ```bash
   # Deploy using production configuration
   docker compose up -d --build

   # Verify all services are running
   docker compose ps
   ```

2. **Check Service Health**

   ```bash
   # Check logs
   docker compose logs

   # Check specific service logs
   docker compose logs rproxy
   docker compose logs back
   docker compose logs front
   ```

3. **Test the Deployment**

   ```bash
   # Test HTTP to HTTPS redirect
   curl -I http://yourdomain.com

   # Test HTTPS response
   curl -I https://yourdomain.com

   # Test API health
   curl https://yourdomain.com/api/v1/
   ```

### Production Features

Production deployment includes:

- **HTTPS Termination**: All traffic encrypted with SSL/TLS
- **Reverse Proxy**: Nginx handles routing and load balancing
- **Monitoring Stack**: Prometheus, Grafana, and Loki for observability
- **Log Management**: Centralized logging with rotation
- **Health Checks**: Container health monitoring
- **Auto-restart**: Services automatically restart on failure
- **Security**: Restricted network access and secure defaults

### Monitoring and Logging

1. **Access Monitoring Services**

   | Service | URL                                            | Access Method       |
   | ------- | ---------------------------------------------- | ------------------- |
   | Grafana | [http://localhost:3000](http://localhost:3000) | SSH tunnel required |
   | Adminer | [http://localhost:8080](http://localhost:8080) | SSH tunnel required |

   **Creating SSH Tunnel:**

   ```bash
   # Tunnel for Grafana
   ssh -L 3000:localhost:3000 user@yourdomain.com

   # Tunnel for Adminer
   ssh -L 8080:localhost:8080 user@yourdomain.com
   ```

2. **Grafana Setup**

   - Login with username `admin` and password from `grafana_password.conf`
   - Configure data sources (Prometheus, Loki)
   - Import dashboards for system monitoring

3. **Log Management**

   ```bash
   # View application logs
   docker compose logs -f

   # View specific service logs
   docker compose logs -f back

   # Log rotation is automatically handled by Docker
   ```

## Environment Configuration

### Global Environment Variables

These can be set in a `.env` file at the project root:

| Variable                 | Default                   | Description                           |
| ------------------------ | ------------------------- | ------------------------------------- |
| `FLUTTER_VERSION`        | `3.35.3`                  | Flutter version for frontend build    |
| `DATABASE_NAME`          | `junqo`                   | PostgreSQL database name              |
| `DATABASE_USER`          | `junqo`                   | PostgreSQL username                   |
| `DATABASE_SHM_SIZE`      | `128mb`                   | Shared memory size for PostgreSQL     |
| `DATABASE_PASSWORD_FILE` | `./db_password.conf`      | Path to database password file        |
| `GRAFANA_PASSWORD_FILE`  | `./grafana_password.conf` | Path to Grafana password file         |
| `SSL_CERTS_PATH`         | `/etc/letsencrypt`        | Path to SSL certificates (production) |
| `API_URL`                | `/api/v1`                 | Backend API URL for frontend          |

**Development-only Variables:**

| Variable         | Default           | Description            |
| ---------------- | ----------------- | ---------------------- |
| `BACK_PORT`      | `4200`            | Backend service port   |
| `ADMINER_PORT`   | `3000`            | Adminer interface port |
| `ADMINER_DESIGN` | `pepa-linha-dark` | Adminer theme          |

### Backend Configuration

Backend configuration is managed through `junqo_back/.env`:

| Variable                 | Required | Default               | Description                                |
| ------------------------ | -------- | --------------------- | ------------------------------------------ |
| `DATABASE_HOST`          | No       | `localhost`           | Database server hostname                   |
| `DATABASE_PORT`          | No       | `5432`                | Database server port                       |
| `DATABASE_USER`          | No       | `junqo`               | Database username                          |
| `DATABASE_NAME`          | No       | `junqo`               | Database name                              |
| `DATABASE_PASSWORD`      | No       | -                     | Database password (if set, overrides file) |
| `DATABASE_PASSWORD_FILE` | No       | `../db_password.conf` | Path to password file                      |
| `JWT_SECRET`             | **Yes**  | -                     | JWT signing secret (min 32 chars)          |
| `CORS_ORIGINS`           | No       | `*`                   | Allowed CORS origins                       |
| `OPENAI_API_KEY`         | **Yes**  | -                     | OpenAI API key for AI features             |
| `NODE_ENV`               | No       | `development`         | Environment mode                           |

**Generating Strong Secrets:**

```bash
# Generate JWT secret
openssl rand -base64 32

# Generate database password
openssl rand -base64 24
```

### Frontend Configuration

Frontend configuration is managed through `junqo_front/config/.env`:

| Variable  | Default                        | Description              |
| --------- | ------------------------------ | ------------------------ |
| `API_URL` | `/api/v1` | Backend API endpoint URL |

**Environment-specific URLs:**

- **Development**: `http://localhost:4200/api/v1`
- **Production**: `https://yourdomain.com/api/v1`

### Database Configuration

Database configuration is handled through environment variables and Docker secrets:

- **Development**: Uses local Docker volume `db_data_dev`
- **Production**: Uses Docker volume `db_data` with persistence
- **Password Management**: Uses Docker secrets for secure password handling
- **Health Checks**: Automated health monitoring with `pg_isready`

## Security Considerations

### Production Security Checklist

- [ ] **Strong Passwords**: Use randomly generated passwords (minimum 24 characters)
- [ ] **JWT Secrets**: Use cryptographically secure JWT secrets (minimum 32 characters)
- [ ] **CORS Configuration**: Restrict CORS to specific domains in production
- [ ] **SSL/TLS**: Ensure all traffic uses HTTPS in production
- [ ] **Firewall**: Configure firewall to only allow necessary ports (80, 443, 22)
- [ ] **Secret Files**: Secure secret files with appropriate permissions (600)
- [ ] **Environment Variables**: Never commit sensitive data to version control
- [ ] **Regular Updates**: Keep Docker images and system packages updated
- [ ] **Database Access**: Restrict database access to application containers only
- [ ] **Monitoring**: Enable monitoring and alerting for security events

### File Permissions

```bash
# Secure secret files
chmod 600 db_password.conf grafana_password.conf

# Secure environment files
chmod 600 junqo_back/.env junqo_front/config/.env

# Verify permissions
ls -la *.conf */config/.env
```

### Network Security

- **Development**: All services accessible via localhost
- **Production**: External access only through Nginx reverse proxy
- **Database**: Only accessible from within Docker network
- **Monitoring**: Grafana and Adminer require SSH tunnel for access

## Maintenance and Updates

### Regular Maintenance Tasks

1. **Update Docker Images**

   ```bash
   # Pull latest images
   docker compose pull

   # Recreate containers with new images
   docker compose up -d --force-recreate
   ```

2. **SSL Certificate Renewal**

   SSL certificates are automatically renewed by Certbot, but verify:

   ```bash
   # Check certificate expiry
   sudo certbot certificates

   # Test renewal
   sudo certbot renew --dry-run
   ```

3. **Database Maintenance**

   ```bash
   # Backup database
   docker compose exec db pg_dump -U junqo junqo > backup_$(date +%Y%m%d).sql

   # Check database size
   docker compose exec db psql -U junqo -d junqo -c "SELECT pg_size_pretty(pg_database_size('junqo'));"
   ```

4. **Log Cleanup**

   Docker automatically handles log rotation, but you can manually clean:

   ```bash
   # Check log sizes
   docker system df

   # Clean up logs (careful - this removes all stopped containers)
   docker system prune
   ```

### Backup Strategy

1. **Database Backups**

   ```bash
   # Create backup script
   #!/bin/bash
   BACKUP_DIR="/opt/junqo/backups"
   DATE=$(date +%Y%m%d_%H%M%S)

   mkdir -p $BACKUP_DIR
   docker compose exec -T db pg_dump -U junqo junqo > "$BACKUP_DIR/junqo_$DATE.sql"

   # Keep only last 7 days
   find $BACKUP_DIR -name "junqo_*.sql" -mtime +7 -delete
   ```

2. **Configuration Backups**

   ```bash
   # Backup configuration files
   tar -czf config_backup_$(date +%Y%m%d).tar.gz \
     .env \
     junqo_back/.env \
     junqo_front/config/.env \
     db_password.conf \
     grafana_password.conf
   ```

### Update Procedure

1. **Backup Current State**
2. **Pull Latest Code**

   ```bash
   git fetch origin
   git checkout main
   git pull origin main
   ```

3. **Update Environment Files** (if needed)
4. **Rebuild and Deploy**

   ```bash
   docker compose down
   docker compose up -d --build
   ```

5. **Verify Deployment**
6. **Run Smoke Tests**

## Troubleshooting

### Common Issues and Solutions

1. **Services Won't Start**

   ```bash
   # Check Docker daemon
   sudo systemctl status docker

   # Check port conflicts
   sudo netstat -tulpn | grep :80
   sudo netstat -tulpn | grep :443

   # Check Docker Compose logs
   docker compose logs
   ```

2. **SSL Certificate Issues**

   ```bash
   # Check certificate status
   sudo certbot certificates

   # Test certificate renewal
   sudo certbot renew --dry-run

   # Check Nginx configuration
   sudo nginx -t
   ```

3. **Database Connection Issues**

   ```bash
   # Check database container
   docker compose exec db psql -U junqo -d junqo

   # Check database logs
   docker compose logs db

   # Verify password file
   cat db_password.conf
   ```

4. **Backend API Issues**

   ```bash
   # Check backend logs
   docker compose logs back

   # Test API health
   curl http://localhost:4200/api/v1/health

   # Check environment variables
   docker compose exec back env | grep -E "DATABASE|JWT|API"
   ```

5. **Frontend Build Issues**

   ```bash
   # Check frontend logs
   docker compose logs front

   # Check frontend configuration
   docker compose exec front cat /etc/nginx/nginx.conf
   ```

### Performance Issues

1. **High Memory Usage**

   ```bash
   # Check container resource usage
   docker stats

   # Increase database shared memory (in .env)
   DATABASE_SHM_SIZE=512mb
   ```

2. **Slow Response Times**

   ```bash
   # Check database performance
   docker compose exec db pg_stat_activity

   # Monitor container logs for errors
   docker compose logs -f
   ```

### Log Analysis

```bash
# View real-time logs for all services
docker compose logs -f

# Filter logs by service
docker compose logs back | grep ERROR

# Check container health status
docker compose ps
```

---

**Next Steps**: After completing this deployment guide, refer to the individual component documentation:

- [Backend Documentation](./backend.md) - for backend-specific development
- [Frontend Documentation](./frontend.md) - for frontend-specific development
- [CI/CD Documentation](./ci_cd.md) - for continuous integration and deployment
- [Logging Setup](./logging_setup.md) - for advanced logging configuration

For questions or issues, please refer to the project's GitHub repository or contact the development team.
