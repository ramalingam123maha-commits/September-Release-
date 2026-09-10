#!/bin/bash

################################################################################
# Fit-Freak Database Backup Script
# Supports: Daily, Weekly, and Monthly backups
# Database: MongoDB
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

# Backup directories
BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups/fit-freak}"
DAILY_BACKUP_DIR="${BACKUP_BASE_DIR}/daily"
WEEKLY_BACKUP_DIR="${BACKUP_BASE_DIR}/weekly"
MONTHLY_BACKUP_DIR="${BACKUP_BASE_DIR}/monthly"

# MongoDB configuration
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/fit-freak}"
MONGODB_HOST="${MONGODB_HOST:-localhost}"
MONGODB_PORT="${MONGODB_PORT:-27017}"
MONGODB_DATABASE="${MONGODB_DATABASE:-fit-freak}"
MONGODB_USER="${MONGODB_USER:-}"
MONGODB_PASSWORD="${MONGODB_PASSWORD:-}"

# Backup retention (days)
DAILY_RETENTION=7
WEEKLY_RETENTION=30
MONTHLY_RETENTION=365

# Logging
LOG_DIR="${BACKUP_BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/backup-$(date +%Y%m%d).log"

# Notification settings
ALERT_EMAIL="${ALERT_EMAIL:-}"
BACKUP_STATUS="SUCCESS"
BACKUP_ERRORS=""

# ============================================================================
# Functions
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

setup_directories() {
    log "INFO" "Creating backup directories..."
    mkdir -p "${DAILY_BACKUP_DIR}"
    mkdir -p "${WEEKLY_BACKUP_DIR}"
    mkdir -p "${MONTHLY_BACKUP_DIR}"
    mkdir -p "${LOG_DIR}"
    chmod 700 "${BACKUP_BASE_DIR}"
    log "INFO" "Directories ready"
}

build_mongodump_command() {
    local cmd="mongodump"
    
    if [[ -n "${MONGODB_HOST}" ]]; then
        cmd="${cmd} --host ${MONGODB_HOST}"
    fi
    
    if [[ -n "${MONGODB_PORT}" ]]; then
        cmd="${cmd} --port ${MONGODB_PORT}"
    fi
    
    if [[ -n "${MONGODB_DATABASE}" ]]; then
        cmd="${cmd} --db ${MONGODB_DATABASE}"
    fi
    
    if [[ -n "${MONGODB_USER}" && -n "${MONGODB_PASSWORD}" ]]; then
        cmd="${cmd} --username ${MONGODB_USER} --password ${MONGODB_PASSWORD} --authenticationDatabase admin"
    fi
    
    echo "${cmd}"
}

perform_backup() {
    local backup_type="$1"
    local backup_dir="$2"
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_path="${backup_dir}/backup_${timestamp}"
    
    log "INFO" "Starting ${backup_type} backup..."
    
    local cmd=$(build_mongodump_command)
    cmd="${cmd} --out ${backup_path}"
    
    if eval "${cmd}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "${backup_type} backup completed successfully"
        
        # Compress backup
        log "INFO" "Compressing ${backup_type} backup..."
        cd "${backup_dir}"
        if tar -czf "backup_${timestamp}.tar.gz" "backup_${timestamp}" >> "${LOG_FILE}" 2>&1; then
            rm -rf "${backup_path}"
            
            # Get backup size
            local backup_size=$(du -sh "backup_${timestamp}.tar.gz" | cut -f1)
            log "INFO" "Backup compressed: backup_${timestamp}.tar.gz (${backup_size})"
            
            echo "${backup_path}" > "${backup_dir}/.last_backup"
            return 0
        else
            log "ERROR" "Failed to compress ${backup_type} backup"
            BACKUP_STATUS="FAILED"
            BACKUP_ERRORS="${BACKUP_ERRORS}Failed to compress ${backup_type} backup\n"
            return 1
        fi
    else
        log "ERROR" "Failed to perform ${backup_type} backup"
        BACKUP_STATUS="FAILED"
        BACKUP_ERRORS="${BACKUP_ERRORS}Failed to perform ${backup_type} backup\n"
        return 1
    fi
}

cleanup_old_backups() {
    local backup_dir="$1"
    local retention_days="$2"
    local backup_type="$3"
    
    log "INFO" "Cleaning up backups older than ${retention_days} days..."
    
    local cutoff_date=$(date -d "${retention_days} days ago" +%s)
    local removed_count=0
    
    while IFS= read -r backup_file; do
        local file_date=$(stat -c %Y "${backup_file}")
        
        if [[ ${file_date} -lt ${cutoff_date} ]]; then
            log "INFO" "Removing old ${backup_type} backup: $(basename ${backup_file})"
            rm -f "${backup_file}"
            ((removed_count++))
        fi
    done < <(find "${backup_dir}" -maxdepth 1 -name "backup_*.tar.gz" -type f)
    
    log "INFO" "Cleanup completed: ${removed_count} old backups removed"
}

send_alert() {
    if [[ -z "${ALERT_EMAIL}" ]]; then
        return 0
    fi
    
    local subject="Fit-Freak Backup Alert - ${BACKUP_STATUS}"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    local body="Backup Job Summary\n"
    body="${body}Timestamp: ${timestamp}\n"
    body="${body}Status: ${BACKUP_STATUS}\n"
    body="${body}Database: ${MONGODB_DATABASE}\n"
    body="${body}\nLog File: ${LOG_FILE}\n"
    
    if [[ "${BACKUP_STATUS}" == "FAILED" ]]; then
        body="${body}\nErrors:\n${BACKUP_ERRORS}"
    fi
    
    echo -e "${body}" | mail -s "${subject}" "${ALERT_EMAIL}" || \
        log "WARN" "Failed to send alert email to ${ALERT_EMAIL}"
}

generate_summary() {
    log "INFO" "=========================================="
    log "INFO" "Backup Summary"
    log "INFO" "=========================================="
    log "INFO" "Backup Status: ${BACKUP_STATUS}"
    log "INFO" "Daily Backups: $(ls -1 ${DAILY_BACKUP_DIR}/*.tar.gz 2>/dev/null | wc -l) files"
    log "INFO" "Weekly Backups: $(ls -1 ${WEEKLY_BACKUP_DIR}/*.tar.gz 2>/dev/null | wc -l) files"
    log "INFO" "Monthly Backups: $(ls -1 ${MONTHLY_BACKUP_DIR}/*.tar.gz 2>/dev/null | wc -l) files"
    log "INFO" "Total Size: $(du -sh ${BACKUP_BASE_DIR} | cut -f1)"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "INFO" "Starting Fit-Freak Database Backup Service"
    log "INFO" "Backup Type: $1"
    
    setup_directories
    
    case "${1:-daily}" in
        daily)
            perform_backup "Daily" "${DAILY_BACKUP_DIR}"
            cleanup_old_backups "${DAILY_BACKUP_DIR}" "${DAILY_RETENTION}" "daily"
            ;;
        weekly)
            perform_backup "Weekly" "${WEEKLY_BACKUP_DIR}"
            cleanup_old_backups "${WEEKLY_BACKUP_DIR}" "${WEEKLY_RETENTION}" "weekly"
            ;;
        monthly)
            perform_backup "Monthly" "${MONTHLY_BACKUP_DIR}"
            cleanup_old_backups "${MONTHLY_BACKUP_DIR}" "${MONTHLY_RETENTION}" "monthly"
            ;;
        all)
            perform_backup "Daily" "${DAILY_BACKUP_DIR}"
            perform_backup "Weekly" "${WEEKLY_BACKUP_DIR}"
            perform_backup "Monthly" "${MONTHLY_BACKUP_DIR}"
            cleanup_old_backups "${DAILY_BACKUP_DIR}" "${DAILY_RETENTION}" "daily"
            cleanup_old_backups "${WEEKLY_BACKUP_DIR}" "${WEEKLY_RETENTION}" "weekly"
            cleanup_old_backups "${MONTHLY_BACKUP_DIR}" "${MONTHLY_RETENTION}" "monthly"
            ;;
        *)
            echo "Usage: $0 {daily|weekly|monthly|all}"
            exit 1
            ;;
    esac
    
    generate_summary
    send_alert
    
    if [[ "${BACKUP_STATUS}" == "FAILED" ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
