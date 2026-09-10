#!/bin/bash

################################################################################
# Backup Verification and Testing Script
# Tests: Backup integrity, recovery time, data consistency
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

BACKUP_BASE_DIR="${BACKUP_BASE_DIR:-/backups/fit-freak}"
TEST_LOG_DIR="${BACKUP_BASE_DIR}/test-logs"
TEST_LOG_FILE="${TEST_LOG_DIR}/verification-$(date +%Y%m%d_%H%M%S).log"
TEST_DATABASE="${TEST_DATABASE:-fit-freak-test}"
MONGODB_HOST="${MONGODB_HOST:-localhost}"
MONGODB_PORT="${MONGODB_PORT:-27017}"

TEST_RESULTS=()
TESTS_PASSED=0
TESTS_FAILED=0

# ============================================================================
# Functions
# ============================================================================

log() {
    local level="$1"
    shift
    local message="$@"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${TEST_LOG_FILE}"
}

setup_test_environment() {
    log "INFO" "Setting up test environment..."
    
    mkdir -p "${TEST_LOG_DIR}"
    chmod 700 "${TEST_LOG_DIR}"
    
    log "INFO" "Test environment ready"
}

record_test_result() {
    local test_name="$1"
    local result="$2"
    local duration="$3"
    local details="$4"
    
    TEST_RESULTS+=("${test_name}|${result}|${duration}|${details}")
    
    if [[ "${result}" == "PASS" ]]; then
        ((TESTS_PASSED++))
        log "INFO" "✓ ${test_name} (${duration}s)"
    else
        ((TESTS_FAILED++))
        log "ERROR" "✗ ${test_name} - ${details} (${duration}s)"
    fi
}

test_backup_file_integrity() {
    log "INFO" "[TEST] Backup File Integrity"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Find latest backup
    local latest_backup=$(find "${BACKUP_BASE_DIR}/daily" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        record_test_result "Backup File Integrity" "FAIL" "$(( $(date +%s) - start_time ))" "No backup files found"
        return 1
    fi
    
    log "INFO" "Testing backup: $(basename ${latest_backup})"
    
    # Test 1: File exists and is readable
    if [[ ! -r "${latest_backup}" ]]; then
        test_passed=false
        error_msg="Backup file not readable"
    fi
    
    # Test 2: Tar file integrity
    if ! tar -tzf "${latest_backup}" > /dev/null 2>&1; then
        test_passed=false
        error_msg="Tar file corrupted"
    fi
    
    # Test 3: File size sanity check
    local file_size=$(stat -c%s "${latest_backup}")
    if [[ ${file_size} -lt 1024 ]]; then  # Less than 1KB
        test_passed=false
        error_msg="Backup file suspiciously small"
    fi
    
    # Test 4: Contains expected directories
    if ! tar -tzf "${latest_backup}" | grep -q "/${MONGODB_DATABASE}/"; then
        test_passed=false
        error_msg="Backup missing database directory"
    fi
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Backup File Integrity" "PASS" "$(( $(date +%s) - start_time ))" ""
        return 0
    else
        record_test_result "Backup File Integrity" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
        return 1
    fi
}

test_backup_age() {
    log "INFO" "[TEST] Backup Age Check"
    
    local start_time=$(date +%s)
    local max_age_hours=36  # Allow up to 1.5 days
    local test_passed=true
    local error_msg=""
    
    # Find latest backup in any category
    local latest_backup=$(find "${BACKUP_BASE_DIR}" -maxdepth 2 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        record_test_result "Backup Age Check" "FAIL" "$(( $(date +%s) - start_time ))" "No backups found"
        return 1
    fi
    
    local file_timestamp=$(stat -c %Y "${latest_backup}")
    local current_timestamp=$(date +%s)
    local age_seconds=$(( current_timestamp - file_timestamp ))
    local age_hours=$(( age_seconds / 3600 ))
    
    if [[ ${age_hours} -gt ${max_age_hours} ]]; then
        test_passed=false
        error_msg="Latest backup is ${age_hours}h old (max allowed: ${max_age_hours}h)"
    fi
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Backup Age Check" "PASS" "$(( $(date +%s) - start_time ))" "Latest backup is ${age_hours}h old"
    else
        record_test_result "Backup Age Check" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
    fi
}

test_backup_extraction() {
    log "INFO" "[TEST] Backup Extraction Test"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Create temporary directory
    local temp_dir=$(mktemp -d)
    trap "rm -rf ${temp_dir}" EXIT
    
    # Find latest backup
    local latest_backup=$(find "${BACKUP_BASE_DIR}/daily" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        record_test_result "Backup Extraction Test" "FAIL" "$(( $(date +%s) - start_time ))" "No backup files found"
        return 1
    fi
    
    # Try to extract
    if tar -xzf "${latest_backup}" -C "${temp_dir}" 2>> "${TEST_LOG_FILE}"; then
        # Verify extraction
        if [[ ! -d "${temp_dir}/${MONGODB_DATABASE}" ]]; then
            test_passed=false
            error_msg="Database directory not found in extraction"
        fi
    else
        test_passed=false
        error_msg="Failed to extract backup"
    fi
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Backup Extraction Test" "PASS" "$(( $(date +%s) - start_time ))" ""
    else
        record_test_result "Backup Extraction Test" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
    fi
}

test_backup_storage_space() {
    log "INFO" "[TEST] Backup Storage Space"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Check available space
    local available_space=$(df "${BACKUP_BASE_DIR}" | awk 'NR==2 {print $4}')
    local used_space=$(du -s "${BACKUP_BASE_DIR}" | cut -f1)
    local required_space=$(( used_space * 2 ))  # Need 2x space for rotation
    
    if [[ ${required_space} -gt ${available_space} ]]; then
        test_passed=false
        error_msg="Insufficient space: ${available_space}KB available, ${required_space}KB required"
    fi
    
    # Warn if >80% full
    local usage_percent=$(( (used_space * 100) / (used_space + available_space) ))
    
    if [[ ${usage_percent} -gt 80 ]]; then
        log "WARN" "Backup storage is ${usage_percent}% full"
    fi
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Backup Storage Space" "PASS" "$(( $(date +%s) - start_time ))" "Used: ${used_space}KB, Available: ${available_space}KB"
    else
        record_test_result "Backup Storage Space" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
    fi
}

test_backup_checksums() {
    log "INFO" "[TEST] Backup Checksum Verification"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Find latest backup
    local latest_backup=$(find "${BACKUP_BASE_DIR}" -maxdepth 2 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        record_test_result "Backup Checksum Verification" "FAIL" "$(( $(date +%s) - start_time ))" "No backup files found"
        return 1
    fi
    
    local backup_dir=$(dirname "${latest_backup}")
    local checksum_file="${backup_dir}/.checksum"
    
    # Create checksum if it doesn't exist
    if [[ ! -f "${checksum_file}" ]]; then
        cd "${backup_dir}"
        sha256sum "$(basename ${latest_backup})" > "${checksum_file}"
    fi
    
    # Verify checksum
    cd "${backup_dir}"
    if sha256sum -c "${checksum_file}" >> "${TEST_LOG_FILE}" 2>&1; then
        record_test_result "Backup Checksum Verification" "PASS" "$(( $(date +%s) - start_time ))" ""
    else
        record_test_result "Backup Checksum Verification" "FAIL" "$(( $(date +%s) - start_time ))" "Checksum mismatch"
        test_passed=false
    fi
}

test_restore_simulation() {
    log "INFO" "[TEST] Restore Simulation (Dry Run)"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Find latest backup
    local latest_backup=$(find "${BACKUP_BASE_DIR}/daily" -maxdepth 1 -name "backup_*.tar.gz" -type f -printf '%T@ %p\n' 2>/dev/null | sort -rn | head -1 | cut -d' ' -f2-)
    
    if [[ -z "${latest_backup}" ]]; then
        record_test_result "Restore Simulation" "FAIL" "$(( $(date +%s) - start_time ))" "No backup files found"
        return 1
    fi
    
    # Create temp directory
    local temp_dir=$(mktemp -d)
    trap "rm -rf ${temp_dir}" EXIT
    
    # Extract and validate
    log "INFO" "Simulating restore from: $(basename ${latest_backup})"
    
    if ! tar -xzf "${latest_backup}" -C "${temp_dir}" 2>> "${TEST_LOG_FILE}"; then
        record_test_result "Restore Simulation" "FAIL" "$(( $(date +%s) - start_time ))" "Failed to extract"
        return 1
    fi
    
    # Check for expected collections
    local collections=("users" "workouts" "goals")
    for collection in "${collections[@]}"; do
        if [[ ! -f "${temp_dir}/${MONGODB_DATABASE}/${collection}.bson" ]]; then
            error_msg="${error_msg}Missing ${collection} collection. "
            test_passed=false
        fi
    done
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Restore Simulation" "PASS" "$(( $(date +%s) - start_time ))" ""
    else
        record_test_result "Restore Simulation" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
    fi
}

test_backup_retention_policy() {
    log "INFO" "[TEST] Backup Retention Policy"
    
    local start_time=$(date +%s)
    local test_passed=true
    local error_msg=""
    
    # Check for backups in different categories
    local daily_count=$(find "${BACKUP_BASE_DIR}/daily" -maxdepth 1 -name "backup_*.tar.gz" -type f | wc -l)
    local weekly_count=$(find "${BACKUP_BASE_DIR}/weekly" -maxdepth 1 -name "backup_*.tar.gz" -type f | wc -l)
    local monthly_count=$(find "${BACKUP_BASE_DIR}/monthly" -maxdepth 1 -name "backup_*.tar.gz" -type f | wc -l)
    
    # Validate retention
    if [[ ${daily_count} -eq 0 ]]; then
        error_msg="${error_msg}No daily backups found. "
        test_passed=false
    fi
    
    if [[ ${daily_count} -gt 10 ]]; then
        error_msg="${error_msg}Too many daily backups (${daily_count}). "
        test_passed=false
    fi
    
    if [[ "${test_passed}" == "true" ]]; then
        record_test_result "Backup Retention Policy" "PASS" "$(( $(date +%s) - start_time ))" "Daily: ${daily_count}, Weekly: ${weekly_count}, Monthly: ${monthly_count}"
    else
        record_test_result "Backup Retention Policy" "FAIL" "$(( $(date +%s) - start_time ))" "${error_msg}"
    fi
}

generate_test_report() {
    log "INFO" "=========================================="
    log "INFO" "Backup Verification Test Report"
    log "INFO" "=========================================="
    log "INFO" "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
    log "INFO" "Total Tests: $((TESTS_PASSED + TESTS_FAILED))"
    log "INFO" "Passed: ${TESTS_PASSED}"
    log "INFO" "Failed: ${TESTS_FAILED}"
    log "INFO" "Success Rate: $(( (TESTS_PASSED * 100) / (TESTS_PASSED + TESTS_FAILED) ))%"
    log "INFO" ""
    
    log "INFO" "Test Results:"
    for result in "${TEST_RESULTS[@]}"; do
        IFS='|' read -r test_name test_result duration details <<< "${result}"
        log "INFO" "  ${test_name}: ${test_result}"
    done
    
    log "INFO" "=========================================="
    log "INFO" "Log File: ${TEST_LOG_FILE}"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    log "INFO" "Starting Backup Verification Tests"
    
    setup_test_environment
    
    # Run all tests
    test_backup_file_integrity
    test_backup_age
    test_backup_extraction
    test_backup_storage_space
    test_backup_checksums
    test_restore_simulation
    test_backup_retention_policy
    
    generate_test_report
    
    if [[ ${TESTS_FAILED} -gt 0 ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
