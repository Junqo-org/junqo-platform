#!/bin/bash

# Log management script for Junqo platform
# This script helps with log rotation and cleanup

LOG_DIR="/var/log/junqo"
MAX_SIZE="100M"
MAX_AGE="30"

# Function to rotate logs when they get too large
rotate_logs() {
    echo "Checking logs for rotation..."

    for log_file in "$LOG_DIR"/*.log; do
        if [[ -f "$log_file" ]]; then
            size=$(du -h "$log_file" | cut -f1)
            echo "Log file $log_file is $size"

            # Check if file is larger than MAX_SIZE
            if [[ $(du -m "$log_file" | cut -f1) -gt 100 ]]; then
                echo "Rotating $log_file (size: $size)"
                timestamp=$(date +%Y%m%d_%H%M%S)
                mv "$log_file" "$log_file.$timestamp"
                touch "$log_file"
                chmod 644 "$log_file"
            fi
        fi
    done
}

# Function to clean old logs
clean_old_logs() {
    echo "Cleaning logs older than $MAX_AGE days..."
    find "$LOG_DIR" -name "*.log.*" -type f -mtime +$MAX_AGE -delete
    echo "Old logs cleaned."
}

# Function to show log statistics
show_stats() {
    echo "=== Junqo Log Statistics ==="
    echo "Log directory: $LOG_DIR"
    echo "Total log files: $(find "$LOG_DIR" -name "*.log*" -type f | wc -l)"
    echo "Current log files:"
    ls -lh "$LOG_DIR"/*.log 2>/dev/null || echo "No current log files found"
    echo "Total disk usage: $(du -sh "$LOG_DIR" 2>/dev/null | cut -f1)"
}

# Main script logic
case "$1" in
    rotate)
        rotate_logs
        ;;
    clean)
        clean_old_logs
        ;;
    stats)
        show_stats
        ;;
    *)
        echo "Usage: $0 {rotate|clean|stats}"
        echo "  rotate  - Rotate large log files"
        echo "  clean   - Remove old rotated logs"
        echo "  stats   - Show log statistics"
        exit 1
        ;;
esac
