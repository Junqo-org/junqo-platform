---
title: Logging Setup
nav_order: 6
---

# Logging Setup

This document describes the logging configuration for the Junqo platform monitoring stack using Loki, Grafana, Prometheus, and Promtail.

## Architecture Overview

The logging system follows containerization best practices by using Docker's native logging capabilities:

- **Docker Logging Driver**: All containers log to stdout/stderr with json-file driver
- **Promtail**: Collects logs directly from Docker containers
- **Loki**: Stores and indexes logs
- **Grafana**: Visualizes logs and metrics
- **Prometheus**: Collects metrics

## Logging Strategy

### Container-Native Logging

All services are configured to log to stdout/stderr instead of log files, following the 12-Factor App principles:

- **No volume mounts** for log files
- **Automatic log rotation** via Docker's json-file driver
- **Centralized collection** through Docker's logging system
- **Better orchestration** compatibility (Kubernetes, Docker Swarm)

### Docker Logging Configuration

Each service uses the following logging configuration:

```yaml
logging:
  driver: "json-file"
  options:
    max-size: "10m"
    max-file: "3"
```

This provides:

- Maximum log file size of 10MB per container
- Keep 3 rotated log files
- Automatic cleanup of old logs

## Log Sources

### 1. Backend Service (`junqo_back`)

- **Location**: Container stdout/stderr
- **Format**: Structured JSON logs with timestamps
- **Content**: Application logs, errors, API requests
- **Collection**: Docker containers at `/var/lib/docker/containers/*/*-json.log`

### 2. Frontend Service (`junqo_front`)

- **Access Logs**: Nginx stdout (`access_log /dev/stdout main`)
- **Error Logs**: Nginx stderr (`error_log /dev/stderr warn`)
- **Format**: Nginx access log format
- **Content**: HTTP requests, responses, errors

### 3. Database Service (`junqo_db`)

- **Location**: PostgreSQL stdout/stderr
- **Format**: PostgreSQL log format
- **Content**: Database connections, queries, errors
- **Configuration**: Logs to Docker logging system

### 4. Reverse Proxy Service (`junqo_rproxy`)

- **Access Logs**: Nginx stdout
- **Error Logs**: Nginx stderr
- **Format**: Nginx access log format
- **Content**: Incoming requests, SSL info, proxy errors

## Configuration Files

### Promtail Configuration (`promtail-config.yaml`)

The configuration includes multiple scraping methods:

1. **Docker Service Discovery**: Automatically discovers containers
2. **Static Container Logs**: Reads Docker's JSON log files directly
3. **Service-Specific Jobs**: Targeted collection for each Junqo service

Key features:

- Automatic container name extraction
- Service labeling for easy filtering
- JSON log parsing for Docker format
- Stream separation (stdout/stderr)

### Loki Configuration (`loki-config.yaml`)

- Configures log storage and indexing
- Sets up retention policies
- Defines ingestion endpoints

### Container Log Locations

Docker stores container logs at:

```sh
/var/lib/docker/containers/<container-id>/<container-id>-json.log
```

Promtail reads these files directly with the pattern:

```sh
/var/lib/docker/containers/*/*-json.log
```

## Service Access

- **Grafana**: http://localhost:3000 (admin/admin)
- **Loki**: http://localhost:3100
- **Prometheus**: http://localhost:9090
- **Adminer**: http://localhost:8080

## Grafana Dashboard Setup

1. Access Grafana at http://localhost:3000
2. Add Loki as a data source:
   - URL: `http://loki:3100`
3. Import or create dashboards for:
   - Application logs by service
   - Error rate monitoring
   - Request volume analysis
   - Performance metrics

## Log Queries Examples

### View Backend Logs

```logql
{container_name="junqo_back"}
```

### View Frontend Logs

```logql
{container_name="junqo_front"}
```

### View Database Logs

```logql
{container_name="junqo_db"}
```

### View Reverse Proxy Logs

```logql
{container_name="junqo_rproxy"}
```

### View Error Logs Only

```logql
{container_name="junqo_back"} |~ "ERROR|error|Error"
```

### View Nginx Access Logs

```logql
{container_name="junqo_rproxy"} | json | line_format "{{.log}}"
```

### Filter by Log Stream

```logql
{container_name="junqo_back", stream="stderr"}
```

## Troubleshooting

### Common Issues

1. **Logs not appearing in Grafana**
   - Check if Promtail container is running: `docker logs junqo_promtail`
   - Verify Docker socket is mounted: `/var/run/docker.sock:/var/run/docker.sock:ro`
   - Check Promtail configuration syntax
   - Ensure containers are actually logging to stdout/stderr

2. **High disk usage**
   - Docker automatically rotates logs based on the json-file driver settings
   - Check Docker log settings: `docker system df`
   - Clean Docker logs: `docker system prune --volumes`

3. **Container logs not being collected**
   - Verify Promtail has access to Docker containers directory
   - Check container log format: `docker logs junqo_back`
   - Ensure logging driver is set to "json-file"

### Debug Commands

```bash
# Check container logs directly
docker logs junqo_back
docker logs junqo_front
docker logs junqo_db

# Check Docker log files
sudo ls -la /var/lib/docker/containers/*/

# View Promtail logs
docker logs junqo_promtail

# View Loki logs
docker logs junqo_loki

# Check log driver configuration
docker inspect junqo_back | grep -A 10 "LogConfig"

# Test Docker logging
docker exec junqo_back echo "Test log message"
```

### Verify Log Collection

```bash
# Check if logs are being written
docker logs --tail 10 junqo_back

# Monitor live logs
docker logs -f junqo_back

# Check log file sizes
docker exec junqo_promtail ls -la /var/lib/docker/containers/*/*-json.log
```

## Advantages of Docker Native Logging

### Benefits

1. **No Permission Issues**: No need to manage file permissions
2. **Automatic Rotation**: Built-in log rotation and cleanup
3. **Better Portability**: Works consistently across environments
4. **Simplified Configuration**: No volume mounts for logs
5. **Orchestration Ready**: Compatible with Kubernetes and Docker Swarm
6. **Resource Efficient**: Less overhead than file-based logging

### Best Practices

1. **Application Code**: Ensure applications log to stdout/stderr
2. **Log Levels**: Use appropriate log levels to avoid excessive logging
3. **Structured Logging**: Use JSON format for better parsing
4. **Log Rotation**: Configure appropriate rotation settings
5. **Monitoring**: Monitor Docker disk usage regularly

## Maintenance

- Logs are automatically rotated by Docker when they exceed 10MB
- Maximum of 3 rotated files are kept per container
- Old logs are automatically cleaned up by Docker
- No manual log rotation scripts needed
- Monitor Docker system disk usage: `docker system df`

## Future Enhancements

- Add metrics collection with Prometheus exporters
- Implement log alerting rules in Grafana
- Add log aggregation dashboards
- Configure log-based alerting
- Add structured logging with correlation IDs
- Implement distributed tracing integration
