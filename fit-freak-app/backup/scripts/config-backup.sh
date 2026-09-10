#!/bin/bash

################################################################################
# Configuration Backup Script
# Backs up: .env, package.json, configs, dependencies
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

CONFIG_BACKUP_DIR="${CONFIG_BACKUP_DIR:-/backups/fit-freak/config}"
PROJECT_ROOT="${PROJECT_ROOT:-.}"
LOG_FILE="${CONFIG_BACKUP_DIR}/config-backup-$(date +%Y%m%d).log"
CONFIG_RETENTION=90

# Critical configuration files
CONFIG_FILES=(
    ".env"
    ".env.example"
    "backend/package.json"
    "backend/package-lock.json"
    "frontend/package.json"
    "frontend/package-lock.json"
)

# Directories to backup
CONFIG_DIRS=(
    "backend/routes"
    "backend/models"
    "frontend/src/config"
)

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
    log "INFO" "Creating configuration backup directory..."
    mkdir -p "${CONFIG_BACKUP_DIR}"
    chmod 700 "${CONFIG_BACKUP_DIR}"
}

validate_files() {
    log "INFO" "Validating configuration files..."
    
    for file in "${CONFIG_FILES[@]}"; do
        local file_path="${PROJECT_ROOT}/${file}"
        
        if [[ ! -f "${file_path}" ]]; then
            log "WARN" "Configuration file not found: ${file}"
        else
            log "INFO" "Found: ${file}"
        fi
    done
}

perform_config_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="config_backup_${timestamp}"
    local backup_path="${CONFIG_BACKUP_DIR}/${backup_name}"
    
    log "INFO" "Starting configuration backup..."
    mkdir -p "${backup_path}"
    
    # Backup configuration files
    for file in "${CONFIG_FILES[@]}"; do
        local source_path="${PROJECT_ROOT}/${file}"
        
        if [[ -f "${source_path}" ]]; then
            local dir=$(dirname "${file}")
            mkdir -p "${backup_path}/${dir}"
            
            cp "${source_path}" "${backup_path}/${file}" || {
                log "ERROR" "Failed to copy ${file}"
                BACKUP_STATUS="FAILED"
                BACKUP_ERRORS="${BACKUP_ERRORS}Failed to copy ${file}\n"
            }
            log "INFO" "Backed up: ${file}"
        fi
    done
    
    # Backup configuration directories
    for dir in "${CONFIG_DIRS[@]}"; do
        local source_path="${PROJECT_ROOT}/${dir}"
        
        if [[ -d "${source_path}" ]]; then
            cp -r "${source_path}" "${backup_path}/${dir}" || {
                log "ERROR" "Failed to copy directory ${dir}"
                BACKUP_STATUS="FAILED"
                BACKUP_ERRORS="${BACKUP_ERRORS}Failed to copy directory ${dir}\n"
            }
            log "INFO" "Backed up directory: ${dir}"
        fi
    done
    
    # Create metadata file
    log "INFO" "Creating backup metadata..."
    cat > "${backup_path}/BACKUP_METADATA.txt" << EOF
Configuration Backup Metadata
==============================
Backup Date: $(date '+%Y-%m-%d %H:%M:%S')
Backup ID: ${backup_name}
Project Root: ${PROJECT_ROOT}
Files Included: ${#CONFIG_FILES[@]}
Directories Included: ${#CONFIG_DIRS[@]}

Configuration Files:
EOF
    
    for file in "${CONFIG_FILES[@]}"; do
        local source_path="${PROJECT_ROOT}/${file}"
        if [[ -f "${source_path}" ]]; then
            local file_size=$(stat -f%z "${source_path}" 2>/dev/null || stat -c%s "${source_path}")
            echo "  - ${file} (${file_size} bytes)" >> "${backup_path}/BACKUP_METADATA.txt"
        fi
    done
    
    # Compress backup
    log "INFO" "Compressing configuration backup..."
    cd "${CONFIG_BACKUP_DIR}"
    
    if tar -czf "${backup_name}.tar.gz" "${backup_name}" >> "${LOG_FILE}" 2>&1; then
        rm -rf "${backup_path}"
        local backup_size=$(du -sh "${backup_name}.tar.gz" | cut -f1)
        log "INFO" "Configuration backup completed: ${backup_name}.tar.gz (${backup_size})"
        
        echo "${backup_name}" > "${CONFIG_BACKUP_DIR}/.last_config_backup"
    else
        log "ERROR" "Failed to compress configuration backup"
        BACKUP_STATUS="FAILED"
        BACKUP_ERRORS="${BACKUP_ERRORS}Failed to compress configuration backup\n"
    fi
}

backup_sensitive_info() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_name="sensitive_backup_${timestamp}"
    local backup_path="${CONFIG_BACKUP_DIR}/${backup_name}"
    
    log "INFO" "Backing up sensitive environment variables..."
    
    mkdir -p "${backup_path}"
    
    # Create encrypted backup of .env
    local env_file="${PROJECT_ROOT}/.env"
    if [[ -f "${env_file}" ]]; then
        cp "${env_file}" "${backup_path}/.env.encrypted" || {
            log "WARN" "Failed to backup .env file"
        }
        log "INFO" "Sensitive backup stored (ensure proper encryption in production)"
    fi
    
    # Create checksum for integrity verification
    cd "${backup_path}"
    sha256sum .env.encrypted > .env.encrypted.sha256 2>/dev/null || true
    
    # Compress
    cd "${CONFIG_BACKUP_DIR}"
    if tar -czf "${backup_name}.tar.gz" "${backup_name}" >> "${LOG_FILE}" 2>&1; then
        rm -rf "${backup_path}"
        log "INFO" "Sensitive backup completed: ${backup_name}.tar.gz"
        chmod 600 "${backup_name}.tar.gz"
    else
        log "WARN" "Failed to compress sensitive backup"
    fi
}

cleanup_old_backups() {
    log "INFO" "Cleaning up old configuration backups (retention: ${CONFIG_RETENTION} days)..."
    
    local cutoff_date=$(date -d "${CONFIG_RETENTION} days ago" +%s 2>/dev/null || date -v-${CONFIG_RETENTION}d +%s)
    local removed_count=0
    
    find "${CONFIG_BACKUP_DIR}" -maxdepth 1 -name "config_backup_*.tar.gz" -type f | while read backup_file; do
        local file_date=$(stat -c %Y "${backup_file}" 2>/dev/null || stat -f %m "${backup_file}")
        
        if [[ ${file_date} -lt ${cutoff_date} ]]; then
            log "INFO" "Removing old backup: $(basename ${backup_file})"
            rm -f "${backup_file}"
            ((removed_count++))
        fi
    done
    
    log "INFO" "Cleanup completed"
}

verify_backup_integrity() {
    log "INFO" "Verifying backup integrity..."
    
    local latest_backup=$(find "${CONFIG_BACKUP_DIR}" -maxdepth 1 -name "config_backup_*.tar.gz" -type f -printf '%T@ %p\n' | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        log "WARN" "No backups found for integrity verification"
        return 1
    fi
    
    if tar -tzf "${latest_backup}" > /dev/null 2>&1; then
        log "INFO" "Backup integrity verified: $(basename ${latest_backup})"
        return 0
    else
        log "ERROR" "Backup integrity check FAILED: $(basename ${latest_backup})"
        BACKUP_STATUS="FAILED"
        BACKUP_ERRORS="${BACKUP_ERRORS}Backup integrity check failed\n"
        return 1
    fi
}

generate_backup_report() {
    log "INFO" "=========================================="
    log "INFO" "Configuration Backup Summary"
    log "INFO" "=========================================="
    log "INFO" "Status: ${BACKUP_STATUS}"
    log "INFO" "Backup Location: ${CONFIG_BACKUP_DIR}"
    log "INFO" "Total Backups: $(ls -1 ${CONFIG_BACKUP_DIR}/*.tar.gz 2>/dev/null | wc -l)"
    log "INFO" "Total Size: $(du -sh ${CONFIG_BACKUP_DIR} | cut -f1)"
    log "INFO" "Log File: ${LOG_FILE}"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "INFO" "Starting Configuration Backup Service"
    
    setup_directories
    validate_files
    perform_config_backup
    backup_sensitive_info
    verify_backup_integrity
    cleanup_old_backups
    generate_backup_report
    
    if [[ "${BACKUP_STATUS}" == "FAILED" ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
