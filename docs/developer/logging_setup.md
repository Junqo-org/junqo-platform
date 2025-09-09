---
title: Logging Setup
nav_order: 6
---

# Logging Setup

This document describes the logging configuration for the Junqo platform monitoring stack using Loki, Grafana, Prometheus, and Promtail.

## Architecture Overview

The logging system collects logs from all services and centralizes them for monitoring and analysis:

- **Promtail**: Collects logs from all services
- **Loki**: Stores and indexes logs
- **Grafana**: Visualizes logs and metrics
- **Prometheus**: Collects metrics (future enhancement)

## Log Sources

### 1. Backend Service (`junqo_back`)

- **Location**: `/var/log/junqo/back.log`
- **Format**: Structured JSON logs with timestamps
- **Content**: Application logs, errors, API requests

### 2. Frontend Service (`junqo_front`)

- **Access Logs**: `/var/log/junqo/front-access.log`
- **Error Logs**: `/var/log/junqo/front-error.log`
- **Format**: Nginx access log format
- **Content**: HTTP requests, responses, errors

### 3. Database Service (`junqo_db`)

- **Location**: `/var/log/junqo/db.log`
- **Format**: PostgreSQL log format
- **Content**: Database connections, queries, errors

### 4. Reverse Proxy Service (`junqo_rproxy`)

- **Access Logs**: `/var/log/junqo/rproxy-access.log`
- **Error Logs**: `/var/log/junqo/rproxy-error.log`
- **Format**: Nginx access log format
- **Content**: Incoming requests, SSL info, proxy errors

## Configuration Files

### Promtail Configuration (`promtail-config.yaml`)

- Defines log scraping jobs for each service
- Adds service labels for easy filtering
- Sends logs to Loki

### Loki Configuration (`loki-config.yaml`)

- Configures log storage and indexing
- Sets up retention policies
- Defines ingestion endpoints

### Log Management

Use the provided script for log maintenance:

```bash
# Check log statistics
./tools/log-management.sh stats

# Rotate large log files
./tools/log-management.sh rotate

# Clean old log files (older than 30 days)
./tools/log-management.sh clean
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
{job="junqo-back"}
```

### View Error Logs Only

```logql
{service="backend"} |= "ERROR"
```

### View Nginx Access Logs

```logql
{service="nginx", log_type="access"}
```

### View Database Connection Logs

```logql
{service="database"} |= "connection"
```

## Troubleshooting

### Common Issues

1. **Logs not appearing in Grafana**
   - Check if Promtail container is running
   - Verify log file permissions in `/var/log/junqo`
   - Check Promtail configuration syntax

2. **High disk usage**
   - Run log rotation: `./tools/log-management.sh rotate`
   - Clean old logs: `./tools/log-management.sh clean`
   - Adjust retention settings in Loki configuration

3. **Container logs not writing to files**
   - Ensure the `junqo_logs` volume is properly mounted
   - Check container permissions for log directory
   - Verify environment variables are set correctly

### Debug Commands

```bash
# Check log volume contents
docker exec junqo_promtail ls -la /var/log/junqo/

# View Promtail logs
docker logs junqo_promtail

# View Loki logs
docker logs loki

# Test log file creation
docker exec junqo_back touch /var/log/junqo/test.log
```

## Maintenance

- Logs are automatically rotated when they exceed 100MB
- Old rotated logs are cleaned after 30 days
- Monitor disk usage regularly
- Review log levels periodically to avoid excessive logging

## Future Enhancements

- Add metrics collection with Prometheus exporters
- Implement log alerting rules
- Add log aggregation dashboards
- Configure log-based alerting
- Add structured logging with correlation IDs
