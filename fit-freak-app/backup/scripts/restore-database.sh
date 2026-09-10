#!/bin/bash

################################################################################
# Database Restore/Rollback Script
# Supports: Point-in-time recovery, full database restore
# Database: MongoDB
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups/fit-freak}"
MONGODB_HOST="${MONGODB_HOST:-localhost}"
MONGODB_PORT="${MONGODB_PORT:-27017}"
MONGODB_DATABASE="${MONGODB_DATABASE:-fit-freak}"
MONGODB_USER="${MONGODB_USER:-}"
MONGODB_PASSWORD="${MONGODB_PASSWORD:-}"

LOG_DIR="${BACKUP_BASE_DIR}/logs"
LOG_FILE="${LOG_DIR}/restore-$(date +%Y%m%d_%H%M%S).log"

RESTORE_BACKUP_PATH=""
RESTORE_STATUS="SUCCESS"
DRY_RUN=false
VERIFY_ONLY=false

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

show_usage() {
    cat << EOF
Usage: $0 [OPTIONS] -b BACKUP_PATH

Restore database from backup

OPTIONS:
    -b, --backup PATH       Path to backup file (required)
    -h, --host HOST         MongoDB host (default: localhost)
    -p, --port PORT         MongoDB port (default: 27017)
    -d, --database DB       Database name (default: fit-freak)
    -u, --user USER         MongoDB username
    -w, --password PASS     MongoDB password
    -v, --verify            Verify backup integrity only (no restore)
    -D, --dry-run           Simulate restore without applying changes
    --help                  Show this help message

EXAMPLES:
    # Restore from daily backup
    $0 -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

    # Verify backup integrity
    $0 -v -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

    # Dry run restore
    $0 -D -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

EOF
    exit 1
}

parse_arguments() {
    while [[ $# -gt 0 ]]; do
        case "$1" in
            -b|--backup)
                RESTORE_BACKUP_PATH="$2"
                shift 2
                ;;
            -h|--host)
                MONGODB_HOST="$2"
                shift 2
                ;;
            -p|--port)
                MONGODB_PORT="$2"
                shift 2
                ;;
            -d|--database)
                MONGODB_DATABASE="$2"
                shift 2
                ;;
            -u|--user)
                MONGODB_USER="$2"
                shift 2
                ;;
            -w|--password)
                MONGODB_PASSWORD="$2"
                shift 2
                ;;
            -v|--verify)
                VERIFY_ONLY=true
                shift
                ;;
            -D|--dry-run)
                DRY_RUN=true
                shift
                ;;
            --help)
                show_usage
                ;;
            *)
                echo "Unknown option: $1"
                show_usage
                ;;
        esac
    done
    
    if [[ -z "${RESTORE_BACKUP_PATH}" ]]; then
        echo "Error: Backup path is required"
        show_usage
    fi
}

setup_directories() {
    mkdir -p "${LOG_DIR}"
    chmod 700 "${BACKUP_BASE_DIR}"
}

verify_backup_file() {
    log "INFO" "Verifying backup file..."
    
    if [[ ! -f "${RESTORE_BACKUP_PATH}" ]]; then
        log "ERROR" "Backup file not found: ${RESTORE_BACKUP_PATH}"
        return 1
    fi
    
    # Check file size
    local file_size=$(du -h "${RESTORE_BACKUP_PATH}" | cut -f1)
    log "INFO" "Backup file size: ${file_size}"
    
    # Verify tar integrity
    if tar -tzf "${RESTORE_BACKUP_PATH}" > /dev/null 2>&1; then
        log "INFO" "Backup file integrity verified"
        return 0
    else
        log "ERROR" "Backup file is corrupted or not a valid tar.gz file"
        return 1
    fi
}

build_mongorestore_command() {
    local dump_dir="$1"
    local cmd="mongorestore"
    
    cmd="${cmd} --host ${MONGODB_HOST}:${MONGODB_PORT}"
    cmd="${cmd} --db ${MONGODB_DATABASE}"
    
    if [[ -n "${MONGODB_USER}" && -n "${MONGODB_PASSWORD}" ]]; then
        cmd="${cmd} --username ${MONGODB_USER} --password ${MONGODB_PASSWORD} --authenticationDatabase admin"
    fi
    
    cmd="${cmd} ${dump_dir}/${MONGODB_DATABASE}"
    
    echo "${cmd}"
}

extract_backup() {
    local temp_dir=$(mktemp -d)
    log "INFO" "Extracting backup to temporary directory: ${temp_dir}"
    
    if tar -xzf "${RESTORE_BACKUP_PATH}" -C "${temp_dir}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Backup extracted successfully"
        echo "${temp_dir}"
        return 0
    else
        log "ERROR" "Failed to extract backup"
        rm -rf "${temp_dir}"
        return 1
    fi
}

verify_mongodb_connection() {
    log "INFO" "Verifying MongoDB connection..."
    
    local cmd="mongostat --host ${MONGODB_HOST}:${MONGODB_PORT} --quiet"
    
    if [[ -n "${MONGODB_USER}" && -n "${MONGODB_PASSWORD}" ]]; then
        cmd="${cmd} --username ${MONGODB_USER} --password ${MONGODB_PASSWORD} --authenticationDatabase admin"
    fi
    
    if timeout 10 eval "${cmd}" > /dev/null 2>&1; then
        log "INFO" "MongoDB connection verified"
        return 0
    else
        log "ERROR" "Cannot connect to MongoDB at ${MONGODB_HOST}:${MONGODB_PORT}"
        return 1
    fi
}

backup_current_database() {
    log "INFO" "Creating safety backup of current database..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local safety_backup_dir="/backups/fit-freak/safety/backup_${timestamp}"
    mkdir -p "${safety_backup_dir}"
    
    local cmd="mongodump --host ${MONGODB_HOST}:${MONGODB_PORT} --db ${MONGODB_DATABASE}"
    
    if [[ -n "${MONGODB_USER}" && -n "${MONGODB_PASSWORD}" ]]; then
        cmd="${cmd} --username ${MONGODB_USER} --password ${MONGODB_PASSWORD} --authenticationDatabase admin"
    fi
    
    cmd="${cmd} --out ${safety_backup_dir}"
    
    if eval "${cmd}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Safety backup created: ${safety_backup_dir}"
        echo "${safety_backup_dir}"
        return 0
    else
        log "ERROR" "Failed to create safety backup"
        return 1
    fi
}

drop_current_collections() {
    log "WARN" "Dropping current collections from database..."
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "INFO" "[DRY RUN] Would drop collections"
        return 0
    fi
    
    # Using MongoDB shell to drop collections
    local mongo_cmd="db.dropDatabase()"
    
    if echo "${mongo_cmd}" | mongosh --host "${MONGODB_HOST}:${MONGODB_PORT}" -d "${MONGODB_DATABASE}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Collections dropped"
        return 0
    else
        log "ERROR" "Failed to drop collections"
        return 1
    fi
}

perform_restore() {
    local extract_dir="$1"
    
    log "INFO" "Starting database restore..."
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "INFO" "[DRY RUN] Simulating restore..."
    fi
    
    # Verify MongoDB connection
    if ! verify_mongodb_connection; then
        log "ERROR" "Cannot proceed with restore due to connection error"
        return 1
    fi
    
    # Create safety backup
    local safety_backup_dir=$(backup_current_database)
    if [[ $? -ne 0 ]]; then
        log "ERROR" "Cannot proceed without safety backup"
        return 1
    fi
    
    # Drop current collections
    if ! drop_current_collections; then
        log "ERROR" "Restore aborted - failed to prepare database"
        return 1
    fi
    
    # Restore from backup
    local cmd=$(build_mongorestore_command "${extract_dir}")
    
    if [[ "${DRY_RUN}" == "true" ]]; then
        log "INFO" "[DRY RUN] Would execute: ${cmd}"
    else
        log "INFO" "Executing restore command..."
        
        if eval "${cmd}" >> "${LOG_FILE}" 2>&1; then
            log "INFO" "Database restore completed successfully"
            log "INFO" "Safety backup retained at: ${safety_backup_dir}"
            return 0
        else
            log "ERROR" "Database restore failed"
            log "WARN" "Attempting to restore safety backup..."
            
            if perform_safety_restore "${safety_backup_dir}"; then
                log "INFO" "Safety backup restored - database returned to original state"
            else
                log "CRITICAL" "Failed to restore safety backup - database is in inconsistent state!"
                RESTORE_STATUS="CRITICAL_FAILURE"
            fi
            
            return 1
        fi
    fi
}

perform_safety_restore() {
    local safety_backup_dir="$1"
    
    log "INFO" "Restoring safety backup from: ${safety_backup_dir}"
    
    local cmd="mongorestore --host ${MONGODB_HOST}:${MONGODB_PORT} --db ${MONGODB_DATABASE}"
    
    if [[ -n "${MONGODB_USER}" && -n "${MONGODB_PASSWORD}" ]]; then
        cmd="${cmd} --username ${MONGODB_USER} --password ${MONGODB_PASSWORD} --authenticationDatabase admin"
    fi
    
    cmd="${cmd} ${safety_backup_dir}/${MONGODB_DATABASE}"
    
    if eval "${cmd}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Safety restore completed"
        return 0
    else
        log "ERROR" "Safety restore failed"
        return 1
    fi
}

verify_restore_integrity() {
    log "INFO" "Verifying restored database integrity..."
    
    # Count documents in collections
    local mongo_cmd="
    db.users.countDocuments();
    db.workouts.countDocuments();
    db.goals.countDocuments();
    "
    
    if echo "${mongo_cmd}" | mongosh --host "${MONGODB_HOST}:${MONGODB_PORT}" -d "${MONGODB_DATABASE}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Database integrity verification passed"
        return 0
    else
        log "ERROR" "Database integrity verification failed"
        return 1
    fi
}

generate_restore_report() {
    log "INFO" "=========================================="
    log "INFO" "Database Restore Summary"
    log "INFO" "=========================================="
    log "INFO" "Status: ${RESTORE_STATUS}"
    log "INFO" "Backup Source: ${RESTORE_BACKUP_PATH}"
    log "INFO" "Target Database: ${MONGODB_DATABASE}"
    log "INFO" "Target Host: ${MONGODB_HOST}:${MONGODB_PORT}"
    log "INFO" "Dry Run: ${DRY_RUN}"
    log "INFO" "Verify Only: ${VERIFY_ONLY}"
    log "INFO" "Log File: ${LOG_FILE}"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "INFO" "Starting Database Restore Service"
    
    parse_arguments "$@"
    setup_directories
    
    log "INFO" "Configuration:"
    log "INFO" "  Backup Path: ${RESTORE_BACKUP_PATH}"
    log "INFO" "  MongoDB Host: ${MONGODB_HOST}:${MONGODB_PORT}"
    log "INFO" "  Database: ${MONGODB_DATABASE}"
    log "INFO" "  Verify Only: ${VERIFY_ONLY}"
    log "INFO" "  Dry Run: ${DRY_RUN}"
    
    # Step 1: Verify backup file
    if ! verify_backup_file; then
        RESTORE_STATUS="FAILED"
        generate_restore_report
        exit 1
    fi
    
    # Step 2: If verify only, stop here
    if [[ "${VERIFY_ONLY}" == "true" ]]; then
        RESTORE_STATUS="VERIFIED"
        generate_restore_report
        exit 0
    fi
    
    # Step 3: Extract backup
    local extract_dir=$(extract_backup)
    if [[ $? -ne 0 ]]; then
        RESTORE_STATUS="FAILED"
        generate_restore_report
        exit 1
    fi
    
    # Step 4: Perform restore
    if perform_restore "${extract_dir}"; then
        # Step 5: Verify integrity
        if verify_restore_integrity; then
            RESTORE_STATUS="SUCCESS"
        else
            RESTORE_STATUS="RESTORE_COMPLETE_VERIFY_FAILED"
        fi
    else
        RESTORE_STATUS="FAILED"
    fi
    
    # Cleanup
    rm -rf "${extract_dir}"
    
    generate_restore_report
    
    if [[ "${RESTORE_STATUS}" != "SUCCESS" ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
