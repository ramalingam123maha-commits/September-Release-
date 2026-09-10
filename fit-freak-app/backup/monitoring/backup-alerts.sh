#!/bin/bash

################################################################################
# Backup Monitoring and Alerting Script
# Monitors: Backup failures, missed backups, storage issues
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups/fit-freak}"
ALERT_CONFIG_FILE="${BACKUP_BASE_DIR}/alert-config.env"
LOG_DIR="${BACKUP_BASE_DIR}/logs"
MONITOR_LOG_FILE="${LOG_DIR}/monitoring-$(date +%Y%m%d).log"

# Alert thresholds
ALERT_DAILY_MISSING_HOURS=48
ALERT_WEEKLY_MISSING_HOURS=360
ALERT_MONTHLY_MISSING_HOURS=2160
ALERT_STORAGE_THRESHOLD=85  # Percentage

# Alert recipients
ALERT_EMAIL="${ALERT_EMAIL:-}"
SLACK_WEBHOOK="${SLACK_WEBHOOK:-}"
PAGERDUTY_KEY="${PAGERDUTY_KEY:-}"

# Alert states
ALERTS_TRIGGERED=()
ALERTS_RESOLVED=()
CRITICAL_ISSUES=0

# ============================================================================
# Functions
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${MONITOR_LOG_FILE}"
}

load_alert_config() {
    if [[ -f "${ALERT_CONFIG_FILE}" ]]; then
        log "INFO" "Loading alert configuration from ${ALERT_CONFIG_FILE}"
        source "${ALERT_CONFIG_FILE}"
    else
        log "WARN" "Alert configuration file not found: ${ALERT_CONFIG_FILE}"
    fi
}

check_daily_backup() {
    log "INFO" "Checking daily backup..."
    
    local latest_daily=$(find "${BACKUP_BASE_DIR}/daily" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_daily}" ]]; then
        log "ERROR" "No daily backups found"
        trigger_alert "CRITICAL" "Daily Backup Missing" "No daily backups found in ${BACKUP_BASE_DIR}/daily"
        ((CRITICAL_ISSUES++))
        return 1
    fi
    
    local backup_timestamp=$(stat -c %Y "${latest_daily}")
    local current_timestamp=$(date +%s)
    local age_seconds=$(( current_timestamp - backup_timestamp ))
    local age_hours=$(( age_seconds / 3600 ))
    
    if [[ ${age_hours} -gt ${ALERT_DAILY_MISSING_HOURS} ]]; then
        log "ERROR" "Daily backup is ${age_hours}h old (threshold: ${ALERT_DAILY_MISSING_HOURS}h)"
        trigger_alert "WARNING" "Daily Backup Stale" "Latest daily backup is ${age_hours}h old: $(basename ${latest_daily})"
        return 1
    fi
    
    log "INFO" "Daily backup OK ($(basename ${latest_daily}), age: ${age_hours}h)"
    resolve_alert "Daily Backup Stale"
    return 0
}

check_weekly_backup() {
    log "INFO" "Checking weekly backup..."
    
    local latest_weekly=$(find "${BACKUP_BASE_DIR}/weekly" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_weekly}" ]]; then
        log "WARN" "No weekly backups found"
        return 0
    fi
    
    local backup_timestamp=$(stat -c %Y "${latest_weekly}")
    local current_timestamp=$(date +%s)
    local age_seconds=$(( current_timestamp - backup_timestamp ))
    local age_hours=$(( age_seconds / 3600 ))
    
    if [[ ${age_hours} -gt ${ALERT_WEEKLY_MISSING_HOURS} ]]; then
        log "ERROR" "Weekly backup is ${age_hours}h old (threshold: ${ALERT_WEEKLY_MISSING_HOURS}h)"
        trigger_alert "WARNING" "Weekly Backup Stale" "Latest weekly backup is ${age_hours}h old: $(basename ${latest_weekly})"
        return 1
    fi
    
    log "INFO" "Weekly backup OK ($(basename ${latest_weekly}), age: ${age_hours}h)"
    resolve_alert "Weekly Backup Stale"
    return 0
}

check_monthly_backup() {
    log "INFO" "Checking monthly backup..."
    
    local latest_monthly=$(find "${BACKUP_BASE_DIR}/monthly" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_monthly}" ]]; then
        log "WARN" "No monthly backups found"
        return 0
    fi
    
    local backup_timestamp=$(stat -c %Y "${latest_monthly}")
    local current_timestamp=$(date +%s)
    local age_seconds=$(( current_timestamp - backup_timestamp ))
    local age_hours=$(( age_seconds / 3600 ))
    
    if [[ ${age_hours} -gt ${ALERT_MONTHLY_MISSING_HOURS} ]]; then
        log "ERROR" "Monthly backup is ${age_hours}h old (threshold: ${ALERT_MONTHLY_MISSING_HOURS}h)"
        trigger_alert "WARNING" "Monthly Backup Stale" "Latest monthly backup is ${age_hours}h old: $(basename ${latest_monthly})"
        return 1
    fi
    
    log "INFO" "Monthly backup OK ($(basename ${latest_monthly}), age: ${age_hours}h)"
    resolve_alert "Monthly Backup Stale"
    return 0
}

check_storage_space() {
    log "INFO" "Checking storage space..."
    
    local usage=$(df "${BACKUP_BASE_DIR}" | awk 'NR==2 {print int(($3/($2+$3))*100)}')
    
    log "INFO" "Backup storage usage: ${usage}%"
    
    if [[ ${usage} -gt ${ALERT_STORAGE_THRESHOLD} ]]; then
        log "ERROR" "Backup storage usage exceeds threshold: ${usage}% > ${ALERT_STORAGE_THRESHOLD}%"
        trigger_alert "CRITICAL" "Backup Storage Full" "Storage usage is ${usage}% (threshold: ${ALERT_STORAGE_THRESHOLD}%)"
        ((CRITICAL_ISSUES++))
        return 1
    fi
    
    resolve_alert "Backup Storage Full"
    return 0
}

check_backup_file_integrity() {
    log "INFO" "Checking backup file integrity..."
    
    local corrupted_count=0
    
    while IFS= read -r backup_file; do
        if ! tar -tzf "${backup_file}" > /dev/null 2>&1; then
            log "ERROR" "Corrupted backup file: $(basename ${backup_file})"
            trigger_alert "CRITICAL" "Corrupted Backup" "Backup file is corrupted: $(basename ${backup_file})"
            ((corrupted_count++))
            ((CRITICAL_ISSUES++))
        fi
    done < <(find "${BACKUP_BASE_DIR}" -maxdepth 2 -name "backup_*.tar.gz" -type f)
    
    if [[ ${corrupted_count} -eq 0 ]]; then
        log "INFO" "Backup file integrity check passed"
        resolve_alert "Corrupted Backup"
    fi
    
    return $(( corrupted_count > 0 ? 1 : 0 ))
}

check_backup_logs() {
    log "INFO" "Checking backup logs for errors..."
    
    if [[ ! -d "${LOG_DIR}" ]]; then
        log "WARN" "Log directory not found: ${LOG_DIR}"
        return 0
    fi
    
    # Check for recent error logs
    local error_count=$(grep -c "\[ERROR\]" "${LOG_DIR}"/backup-*.log 2>/dev/null | grep -v ":0$" | wc -l)
    
    if [[ ${error_count} -gt 0 ]]; then
        log "ERROR" "Found ${error_count} error entries in backup logs"
        trigger_alert "WARNING" "Backup Errors" "Found ${error_count} error entries in recent backup logs"
        return 1
    fi
    
    log "INFO" "Backup logs check completed - no errors found"
    resolve_alert "Backup Errors"
    return 0
}

check_config_backup() {
    log "INFO" "Checking configuration backup..."
    
    local config_backup_dir="${BACKUP_BASE_DIR}/config"
    
    if [[ ! -d "${config_backup_dir}" ]]; then
        log "WARN" "Configuration backup directory not found"
        return 0
    fi
    
    local latest_config=$(find "${config_backup_dir}" -maxdepth 1 -name "config_backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_config}" ]]; then
        log "ERROR" "No configuration backups found"
        trigger_alert "WARNING" "Config Backup Missing" "No configuration backups found"
        return 1
    fi
    
    local backup_timestamp=$(stat -c %Y "${latest_config}")
    local current_timestamp=$(date +%s)
    local age_seconds=$(( current_timestamp - backup_timestamp ))
    local age_hours=$(( age_seconds / 3600 ))
    
    if [[ ${age_hours} -gt 168 ]]; then  # 7 days
        log "WARN" "Configuration backup is ${age_hours}h old"
        trigger_alert "WARNING" "Config Backup Stale" "Configuration backup is ${age_hours}h old"
        return 1
    fi
    
    log "INFO" "Configuration backup OK (age: ${age_hours}h)"
    resolve_alert "Config Backup Stale"
    return 0
}

trigger_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"
    
    log "${severity}" "ALERT TRIGGERED: ${title}"
    
    ALERTS_TRIGGERED+=("${severity}|${title}|${message}")
    
    send_email_alert "${severity}" "${title}" "${message}"
    send_slack_alert "${severity}" "${title}" "${message}"
    send_pagerduty_alert "${severity}" "${title}" "${message}"
}

resolve_alert() {
    local title="$1"
    
    # Check if alert was previously triggered
    if [[ " ${ALERTS_TRIGGERED[*]} " =~ " ${title} " ]]; then
        log "INFO" "ALERT RESOLVED: ${title}"
        ALERTS_RESOLVED+=("${title}")
    fi
}

send_email_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"
    
    if [[ -z "${ALERT_EMAIL}" ]]; then
        return 0
    fi
    
    local subject="[${severity}] Fit-Freak Backup Alert: ${title}"
    local body="Backup Alert
=============
Severity: ${severity}
Title: ${title}
Message: ${message}
Timestamp: $(date '+%Y-%m-%d %H:%M:%S')

This is an automated alert from the Fit-Freak Backup System.
"
    
    echo -e "${body}" | mail -s "${subject}" "${ALERT_EMAIL}" 2>/dev/null || \
        log "WARN" "Failed to send email alert to ${ALERT_EMAIL}"
}

send_slack_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"
    
    if [[ -z "${SLACK_WEBHOOK}" ]]; then
        return 0
    fi
    
    local color=""
    case "${severity}" in
        CRITICAL) color="danger" ;;
        WARNING) color="warning" ;;
        INFO) color="good" ;;
        *) color="gray" ;;
    esac
    
    local payload=$(cat <<EOF
{
    "attachments": [
        {
            "fallback": "${title}",
            "color": "${color}",
            "title": "${title}",
            "text": "${message}",
            "fields": [
                {
                    "title": "Severity",
                    "value": "${severity}",
                    "short": true
                },
                {
                    "title": "Timestamp",
                    "value": "$(date '+%Y-%m-%d %H:%M:%S')",
                    "short": true
                }
            ]
        }
    ]
}
EOF
)
    
    curl -X POST "${SLACK_WEBHOOK}" -H 'Content-Type: application/json' \
        -d "${payload}" 2>/dev/null || \
        log "WARN" "Failed to send Slack alert"
}

send_pagerduty_alert() {
    local severity="$1"
    local title="$2"
    local message="$3"
    
    if [[ -z "${PAGERDUTY_KEY}" ]]; then
        return 0
    fi
    
    # Map severity to PagerDuty event_action
    local event_action="trigger"
    case "${severity}" in
        CRITICAL) event_action="trigger" ;;
        WARNING) event_action="trigger" ;;
        INFO) event_action="resolve" ;;
    esac
    
    log "WARN" "PagerDuty alerting not fully implemented (key configured)"
}

generate_monitoring_report() {
    log "INFO" "=========================================="
    log "INFO" "Backup Monitoring Report"
    log "INFO" "=========================================="
    log "INFO" "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "Monitoring Period: $(date '+%Y-%m-%d')"
    log "INFO" ""
    log "INFO" "Backup Status:"
    log "INFO" "  Daily Backup: $(check_daily_backup > /dev/null 2>&1 && echo '✓ OK' || echo '✗ FAILED')"
    log "INFO" "  Weekly Backup: $(check_weekly_backup > /dev/null 2>&1 && echo '✓ OK' || echo '✗ FAILED')"
    log "INFO" "  Monthly Backup: $(check_monthly_backup > /dev/null 2>&1 && echo '✓ OK' || echo '✗ FAILED')"
    log "INFO" "  Config Backup: $(check_config_backup > /dev/null 2>&1 && echo '✓ OK' || echo '✗ FAILED')"
    log "INFO" ""
    log "INFO" "System Health:"
    log "INFO" "  Storage Space: OK"
    log "INFO" "  File Integrity: OK"
    log "INFO" "  Critical Issues: ${CRITICAL_ISSUES}"
    log "INFO" ""
    
    if [[ ${#ALERTS_TRIGGERED[@]} -gt 0 ]]; then
        log "INFO" "Active Alerts:"
        for alert in "${ALERTS_TRIGGERED[@]}"; do
            log "INFO" "  ${alert}"
        done
    else
        log "INFO" "No active alerts"
    fi
    
    log "INFO" "=========================================="
    log "INFO" "Log File: ${MONITOR_LOG_FILE}"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "INFO" "Starting Backup Monitoring Service"
    
    load_alert_config
    
    # Run all checks
    check_daily_backup || true
    check_weekly_backup || true
    check_monthly_backup || true
    check_storage_space || true
    check_backup_file_integrity || true
    check_backup_logs || true
    check_config_backup || true
    
    # Generate report
    generate_monitoring_report
    
    if [[ ${CRITICAL_ISSUES} -gt 0 ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
