#!/bin/bash

################################################################################
# Code Rollback Script
# Supports: Git-based rollback, version management
# Created: 2024
################################################################################

set -e

# ============================================================================
# Configuration
# ============================================================================

PROJECT_ROOT="${PROJECT_ROOT:-.}"
LOG_DIR="${LOG_DIR:-/backups/fit-freak/logs}"
LOG_FILE="${LOG_DIR}/rollback-$(date +%Y%m%d_%H%M%S).log"
GIT_REMOTE="${GIT_REMOTE:-origin}"
ROLLBACK_STATUS="SUCCESS"

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
Usage: $0 [COMMAND] [OPTIONS]

Code Rollback Management

COMMANDS:
    commit COMMIT_HASH          Rollback to specific commit
    tag TAG_NAME                Rollback to specific tag
    branch BRANCH_NAME          Rollback to specific branch
    list-commits COUNT          List last N commits
    list-tags                   List all tags
    create-tag TAG MESSAGE      Create a checkpoint tag
    backup-current              Backup current code state
    status                      Show current status
    --help                      Show this help message

EXAMPLES:
    # Rollback to commit
    $0 commit abc1234

    # Rollback to version tag
    $0 tag v1.0.0

    # List last 10 commits
    $0 list-commits 10

    # Create backup tag
    $0 create-tag pre-deployment "Before deploying v2.0.0"

EOF
    exit 1
}

setup_directories() {
    mkdir -p "${LOG_DIR}"
    chmod 700 "${LOG_DIR}"
}

verify_git_repo() {
    log "INFO" "Verifying git repository..."
    
    if [[ ! -d "${PROJECT_ROOT}/.git" ]]; then
        log "ERROR" "Not a git repository: ${PROJECT_ROOT}"
        return 1
    fi
    
    cd "${PROJECT_ROOT}" || return 1
    
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log "ERROR" "Invalid git repository"
        return 1
    fi
    
    log "INFO" "Git repository verified"
    return 0
}

get_current_state() {
    cd "${PROJECT_ROOT}" || return 1
    
    local current_branch=$(git rev-parse --abbrev-ref HEAD)
    local current_commit=$(git rev-parse HEAD)
    local current_tag=$(git describe --tags --exact-match 2>/dev/null || echo "none")
    
    log "INFO" "Current State:"
    log "INFO" "  Branch: ${current_branch}"
    log "INFO" "  Commit: ${current_commit:0:8}"
    log "INFO" "  Tag: ${current_tag}"
}

check_working_directory() {
    log "INFO" "Checking working directory status..."
    
    cd "${PROJECT_ROOT}" || return 1
    
    if ! git diff-index --quiet HEAD --; then
        log "WARN" "Working directory has uncommitted changes"
        log "INFO" "Changes will be stashed before rollback"
        
        if git stash >> "${LOG_FILE}" 2>&1; then
            log "INFO" "Changes stashed to git stash"
            return 0
        else
            log "ERROR" "Failed to stash changes"
            return 1
        fi
    fi
    
    log "INFO" "Working directory is clean"
    return 0
}

backup_current_code() {
    log "INFO" "Creating backup of current code..."
    
    cd "${PROJECT_ROOT}" || return 1
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local current_commit=$(git rev-parse HEAD)
    local backup_tag="backup_${timestamp}_${current_commit:0:8}"
    
    if git tag "${backup_tag}" -m "Automatic backup before rollback - ${timestamp}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Backup tag created: ${backup_tag}"
        echo "${backup_tag}"
        return 0
    else
        log "ERROR" "Failed to create backup tag"
        return 1
    fi
}

list_commits() {
    local count="${1:-10}"
    
    log "INFO" "Listing last ${count} commits..."
    
    cd "${PROJECT_ROOT}" || return 1
    
    git log --oneline -n "${count}" | while read line; do
        log "INFO" "${line}"
    done
}

list_tags() {
    log "INFO" "Available tags..."
    
    cd "${PROJECT_ROOT}" || return 1
    
    if git tag -l | head -20 | while read tag; do
        local tag_message=$(git tag -l --format='%(refname:short) - %(subject)' "${tag}")
        log "INFO" "${tag_message}"
    done; then
        return 0
    else
        log "WARN" "No tags found"
        return 1
    fi
}

rollback_to_commit() {
    local target_commit="$1"
    
    log "INFO" "Rolling back to commit: ${target_commit}"
    
    if [[ -z "${target_commit}" ]]; then
        log "ERROR" "Commit hash required"
        return 1
    fi
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Verify commit exists
    if ! git cat-file -t "${target_commit}" > /dev/null 2>&1; then
        log "ERROR" "Commit not found: ${target_commit}"
        return 1
    fi
    
    # Create backup
    local backup_tag=$(backup_current_code)
    if [[ $? -ne 0 ]]; then
        log "ERROR" "Rollback aborted - could not create backup"
        return 1
    fi
    
    # Checkout commit
    log "INFO" "Checking out commit ${target_commit:0:8}..."
    
    if git checkout "${target_commit}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Successfully rolled back to: ${target_commit:0:8}"
        log "INFO" "Previous state backed up as: ${backup_tag}"
        return 0
    else
        log "ERROR" "Failed to checkout commit"
        ROLLBACK_STATUS="FAILED"
        return 1
    fi
}

rollback_to_tag() {
    local target_tag="$1"
    
    log "INFO" "Rolling back to tag: ${target_tag}"
    
    if [[ -z "${target_tag}" ]]; then
        log "ERROR" "Tag name required"
        return 1
    fi
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Verify tag exists
    if ! git rev-parse "${target_tag}" > /dev/null 2>&1; then
        log "ERROR" "Tag not found: ${target_tag}"
        return 1
    fi
    
    # Create backup
    local backup_tag=$(backup_current_code)
    if [[ $? -ne 0 ]]; then
        log "ERROR" "Rollback aborted - could not create backup"
        return 1
    fi
    
    # Checkout tag
    log "INFO" "Checking out tag ${target_tag}..."
    
    if git checkout "${target_tag}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Successfully rolled back to: ${target_tag}"
        log "INFO" "Previous state backed up as: ${backup_tag}"
        
        # Verify rollback
        local commit=$(git rev-parse HEAD)
        log "INFO" "Current commit: ${commit:0:8}"
        
        return 0
    else
        log "ERROR" "Failed to checkout tag"
        ROLLBACK_STATUS="FAILED"
        return 1
    fi
}

rollback_to_branch() {
    local target_branch="$1"
    
    log "INFO" "Rolling back to branch: ${target_branch}"
    
    if [[ -z "${target_branch}" ]]; then
        log "ERROR" "Branch name required"
        return 1
    fi
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Verify branch exists
    if ! git rev-parse "${target_branch}" > /dev/null 2>&1; then
        log "ERROR" "Branch not found: ${target_branch}"
        return 1
    fi
    
    # Create backup
    local backup_tag=$(backup_current_code)
    if [[ $? -ne 0 ]]; then
        log "ERROR" "Rollback aborted - could not create backup"
        return 1
    fi
    
    # Checkout branch
    log "INFO" "Checking out branch ${target_branch}..."
    
    if git checkout "${target_branch}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Successfully rolled back to: ${target_branch}"
        log "INFO" "Previous state backed up as: ${backup_tag}"
        
        # Pull latest
        if git pull "${GIT_REMOTE}" "${target_branch}" >> "${LOG_FILE}" 2>&1; then
            log "INFO" "Pulled latest changes from ${GIT_REMOTE}/${target_branch}"
        else
            log "WARN" "Could not pull latest changes"
        fi
        
        return 0
    else
        log "ERROR" "Failed to checkout branch"
        ROLLBACK_STATUS="FAILED"
        return 1
    fi
}

create_checkpoint_tag() {
    local tag_name="$1"
    local message="$2"
    
    if [[ -z "${tag_name}" ]]; then
        log "ERROR" "Tag name required"
        return 1
    fi
    
    log "INFO" "Creating checkpoint tag: ${tag_name}"
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Verify tag doesn't exist
    if git rev-parse "${tag_name}" > /dev/null 2>&1; then
        log "ERROR" "Tag already exists: ${tag_name}"
        return 1
    fi
    
    if git tag "${tag_name}" -m "${message:-Checkpoint tag}" >> "${LOG_FILE}" 2>&1; then
        log "INFO" "Checkpoint tag created: ${tag_name}"
        
        # Push tag to remote
        if git push "${GIT_REMOTE}" "${tag_name}" >> "${LOG_FILE}" 2>&1; then
            log "INFO" "Tag pushed to remote"
        else
            log "WARN" "Could not push tag to remote"
        fi
        
        return 0
    else
        log "ERROR" "Failed to create tag"
        ROLLBACK_STATUS="FAILED"
        return 1
    fi
}

verify_rollback() {
    log "INFO" "Verifying rollback integrity..."
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Check file structure
    local critical_files=(
        "backend/server.js"
        "backend/package.json"
        "frontend/package.json"
    )
    
    for file in "${critical_files[@]}"; do
        if [[ ! -f "${file}" ]]; then
            log "ERROR" "Critical file missing: ${file}"
            ROLLBACK_STATUS="INTEGRITY_FAILED"
            return 1
        fi
    done
    
    log "INFO" "Rollback integrity verified"
    return 0
}

show_status() {
    log "INFO" "Rollback Status Report"
    log "INFO" "=========================================="
    
    get_current_state
    
    cd "${PROJECT_ROOT}" || return 1
    
    # Show recent commits
    log "INFO" "Recent commits:"
    git log --oneline -5 | while read line; do
        log "INFO" "  ${line}"
    done
    
    # Show recent tags
    log "INFO" "Recent tags:"
    git tag -l --sort=-version:refname | head -5 | while read tag; do
        log "INFO" "  ${tag}"
    done
    
    log "INFO" "=========================================="
}

generate_rollback_report() {
    log "INFO" "=========================================="
    log "INFO" "Code Rollback Summary"
    log "INFO" "=========================================="
    log "INFO" "Status: ${ROLLBACK_STATUS}"
    log "INFO" "Project Root: ${PROJECT_ROOT}"
    log "INFO" "Log File: ${LOG_FILE}"
    log "INFO" "=========================================="
}

# ============================================================================
# Main Execution
# ============================================================================

main() {
    setup_directories
    
    log "INFO" "Starting Code Rollback Service"
    
    if ! verify_git_repo; then
        ROLLBACK_STATUS="FAILED"
        generate_rollback_report
        exit 1
    fi
    
    local command="${1:-help}"
    shift || true
    
    case "${command}" in
        commit)
            check_working_directory || exit 1
            rollback_to_commit "$@"
            ;;
        tag)
            check_working_directory || exit 1
            rollback_to_tag "$@"
            ;;
        branch)
            check_working_directory || exit 1
            rollback_to_branch "$@"
            ;;
        create-tag)
            create_checkpoint_tag "$@"
            ;;
        list-commits)
            list_commits "$@"
            ;;
        list-tags)
            list_tags
            ;;
        backup-current)
            backup_current_code
            ;;
        status)
            show_status
            ;;
        --help|-h)
            show_usage
            ;;
        *)
            echo "Unknown command: ${command}"
            show_usage
            ;;
    esac
    
    verify_rollback
    generate_rollback_report
    
    if [[ "${ROLLBACK_STATUS}" == "FAILED" || "${ROLLBACK_STATUS}" == "INTEGRITY_FAILED" ]]; then
        exit 1
    fi
    
    exit 0
}

main "$@"
