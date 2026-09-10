# Backup and Disaster Recovery System - Setup Guide

## Quick Start

This guide will help you set up the complete backup and disaster recovery system for Fit-Freak.

---

## Prerequisites

### System Requirements
- Linux server (Ubuntu 20.04+ or RHEL 8+)
- MongoDB installed and running
- Node.js and npm installed
- Git repository initialized
- At least 50 GB free disk space for backups
- Bash shell (4.0+)

### Required Software
```bash
# Install required packages
sudo apt-get update
sudo apt-get install -y \
  mongodb-database-tools \
  mongosh \
  tar \
  gzip \
  curl \
  mailutils

# Verify installations
mongodump --version
mongosh --version
tar --version
```

### Permissions
```bash
# Create backup user (optional but recommended)
sudo useradd -m -s /bin/bash backup-user
sudo usermod -aG sudo backup-user

# Set permissions
sudo mkdir -p /backups/fit-freak
sudo chown backup-user:backup-user /backups/fit-freak
sudo chmod 700 /backups/fit-freak
```

---

## Installation Steps

### Step 1: Clone/Setup Backup Directory Structure

```bash
# Navigate to project root
cd /home/user/September-Release-/fit-freak-app

# Create backup directory structure
mkdir -p backup/scripts
mkdir -p backup/tests
mkdir -p backup/monitoring
mkdir -p backup/docs

# Make all scripts executable
chmod +x backup/scripts/*.sh
chmod +x backup/tests/*.sh
chmod +x backup/monitoring/*.sh
```

### Step 2: Configure Environment Variables

Create `/backups/fit-freak/backup.env`:

```bash
# Create configuration file
sudo tee /backups/fit-freak/backup.env > /dev/null << 'EOF'
# Backup Directory Configuration
BACKUP_BASE_DIR=/backups/fit-freak
DAILY_BACKUP_DIR=/backups/fit-freak/daily
WEEKLY_BACKUP_DIR=/backups/fit-freak/weekly
MONTHLY_BACKUP_DIR=/backups/fit-freak/monthly

# MongoDB Configuration
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=fit-freak
MONGODB_USER=
MONGODB_PASSWORD=

# Retention Policies (days)
DAILY_RETENTION=7
WEEKLY_RETENTION=30
MONTHLY_RETENTION=365

# Alert Configuration
ALERT_EMAIL=admin@example.com
SLACK_WEBHOOK=https://hooks.slack.com/services/[YOUR_WEBHOOK]
PAGERDUTY_KEY=

# Project Configuration
PROJECT_ROOT=/home/user/September-Release-/fit-freak-app
GIT_REMOTE=origin

# Logging
LOG_DIR=/backups/fit-freak/logs

# Storage Alerts
ALERT_STORAGE_THRESHOLD=85
EOF

# Secure the configuration
sudo chmod 600 /backups/fit-freak/backup.env
sudo chown backup-user:backup-user /backups/fit-freak/backup.env
```

### Step 3: Create Alert Configuration

Create `/backups/fit-freak/alert-config.env`:

```bash
sudo tee /backups/fit-freak/alert-config.env > /dev/null << 'EOF'
# Alert Configuration for Backup Monitoring

# Email alerts
ALERT_EMAIL="admin@company.com,devops-team@company.com"

# Slack Webhook URL (optional)
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"

# PagerDuty Integration Key (optional)
PAGERDUTY_KEY="YOUR_PAGERDUTY_KEY"

# Alert Thresholds
ALERT_DAILY_MISSING_HOURS=48
ALERT_WEEKLY_MISSING_HOURS=360
ALERT_MONTHLY_MISSING_HOURS=2160
ALERT_STORAGE_THRESHOLD=85
EOF

sudo chmod 600 /backups/fit-freak/alert-config.env
```

### Step 4: Initialize Directory Structure

```bash
# Create all necessary directories
sudo bash << 'EOF'
BACKUP_DIR=/backups/fit-freak

mkdir -p $BACKUP_DIR/{daily,weekly,monthly,config,safety,logs,test-logs,validation-logs}

# Set proper permissions
chmod 700 $BACKUP_DIR
chmod 755 $BACKUP_DIR/{daily,weekly,monthly,config,logs}

# Create symlinks for easier access
ln -sf $BACKUP_DIR /backups/fit-freak-backups

echo "✓ Directory structure initialized"
EOF
```

---

## Cron Job Configuration

### Automated Daily Backup (Recommended)

```bash
# Edit crontab
sudo crontab -e

# Add the following lines:

# Daily backup - runs at 2:00 AM UTC
0 2 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/database-backup.sh daily >> /backups/fit-freak/logs/cron-backup.log 2>&1

# Configuration backup - runs at 2:30 AM UTC
30 2 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/config-backup.sh >> /backups/fit-freak/logs/cron-config-backup.log 2>&1

# Weekly backup - runs Sunday at 3:00 AM UTC
0 3 * * 0 source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/database-backup.sh weekly >> /backups/fit-freak/logs/cron-backup.log 2>&1

# Monthly backup - runs 1st at 4:00 AM UTC
0 4 1 * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/database-backup.sh monthly >> /backups/fit-freak/logs/cron-backup.log 2>&1

# Backup verification - runs every 6 hours
0 */6 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/tests/backup-verification.sh >> /backups/fit-freak/logs/cron-verify.log 2>&1

# Backup monitoring - runs every hour
0 * * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/monitoring/backup-alerts.sh >> /backups/fit-freak/logs/cron-monitoring.log 2>&1
```

### For Non-Root Users (Using backup-user)

```bash
# Switch to backup user
sudo -u backup-user crontab -e

# Add cron jobs as shown above
```

### Verify Cron Jobs

```bash
# List all cron jobs for current user
sudo crontab -l

# Check cron log
sudo tail -f /var/log/syslog | grep CRON

# Check backup logs
sudo tail -f /backups/fit-freak/logs/cron-backup.log
```

---

## Manual Testing

### Test 1: Verify Backup Configuration

```bash
# Source environment
source /backups/fit-freak/backup.env

# Check all required directories
ls -lah $BACKUP_BASE_DIR/

# Verify MongoDB connection
mongosh --eval "db.adminCommand('ping')"
```

### Test 2: Perform Manual Daily Backup

```bash
# Run backup manually
source /backups/fit-freak/backup.env
/home/user/fit-freak-app/backup/scripts/database-backup.sh daily

# Check results
ls -lh $DAILY_BACKUP_DIR/
tail -50 $LOG_DIR/backup-$(date +%Y%m%d).log
```

### Test 3: Verify Backup Integrity

```bash
# Run verification tests
source /backups/fit-freak/backup.env
/home/user/fit-freak-app/backup/tests/backup-verification.sh

# Check results
tail -50 $LOG_DIR/verification-*.log
```

### Test 4: Test Restore Process

```bash
# Find latest backup
LATEST_BACKUP=$(ls -t /backups/fit-freak/daily/*.tar.gz | head -1)

# Test restore (dry run - doesn't actually restore)
source /backups/fit-freak/backup.env
/home/user/fit-freak-app/backup/scripts/restore-database.sh \
  --dry-run \
  -b "$LATEST_BACKUP"

# Verify restore
tail -100 /backups/fit-freak/logs/restore-*.log
```

### Test 5: Validate Restore Readiness

```bash
# Validate backup for restoration
LATEST_BACKUP=$(ls -t /backups/fit-freak/daily/*.tar.gz | head -1)

source /backups/fit-freak/backup.env
/home/user/fit-freak-app/backup/tests/restore-validation.sh \
  -b "$LATEST_BACKUP"

# Check validation results
tail -50 /backups/fit-freak/validation-logs/validation-*.log
```

---

## Monitoring Setup

### Email Alerts Configuration

```bash
# Edit alert configuration
sudo nano /backups/fit-freak/alert-config.env

# Set email recipients
ALERT_EMAIL="admin@company.com,devops@company.com"
```

### Slack Integration (Optional)

1. Create Slack webhook:
   - Go to https://api.slack.com/apps
   - Create new app
   - Enable Incoming Webhooks
   - Add webhook URL to alert-config.env

```bash
SLACK_WEBHOOK="https://hooks.slack.com/services/YOUR/WEBHOOK/URL"
```

### PagerDuty Integration (Optional)

1. Get PagerDuty integration key
2. Add to alert-config.env:

```bash
PAGERDUTY_KEY="YOUR_PAGERDUTY_KEY"
```

### Monitor Backup Status

```bash
# Watch backup logs in real-time
sudo tail -f /backups/fit-freak/logs/backup-*.log

# Monitor all activity
sudo tail -f /backups/fit-freak/logs/*

# Check monitoring health
source /backups/fit-freak/backup.env
/home/user/fit-freak-app/backup/monitoring/backup-alerts.sh
```

---

## Health Checks

### Daily Health Check Script

Create `/usr/local/bin/check-backups.sh`:

```bash
#!/bin/bash

echo "=== Backup System Health Check ==="
echo "Time: $(date)"
echo ""

source /backups/fit-freak/backup.env

# Check backup directory
echo "Backup Storage:"
du -sh $BACKUP_BASE_DIR
df -h $BACKUP_BASE_DIR | tail -1

echo ""
echo "Latest Backups:"
echo "Daily:   $(ls -lh $DAILY_BACKUP_DIR/*.tar.gz 2>/dev/null | tail -1 | awk '{print $9, $5}')"
echo "Weekly:  $(ls -lh $WEEKLY_BACKUP_DIR/*.tar.gz 2>/dev/null | tail -1 | awk '{print $9, $5}')"
echo "Monthly: $(ls -lh $MONTHLY_BACKUP_DIR/*.tar.gz 2>/dev/null | tail -1 | awk '{print $9, $5}')"

echo ""
echo "Backup File Counts:"
echo "Daily:   $(ls -1 $DAILY_BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l) files"
echo "Weekly:  $(ls -1 $WEEKLY_BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l) files"
echo "Monthly: $(ls -1 $MONTHLY_BACKUP_DIR/*.tar.gz 2>/dev/null | wc -l) files"

echo ""
echo "Recent Errors:"
grep ERROR /backups/fit-freak/logs/backup-*.log 2>/dev/null | tail -5 || echo "No errors found"
```

Make executable:
```bash
sudo chmod +x /usr/local/bin/check-backups.sh

# Run health check
/usr/local/bin/check-backups.sh
```

---

## Troubleshooting

### Issue: "Permission denied" when running backup scripts

**Solution**:
```bash
# Make scripts executable
chmod +x /home/user/fit-freak-app/backup/scripts/*.sh
chmod +x /home/user/fit-freak-app/backup/tests/*.sh
chmod +x /home/user/fit-freak-app/backup/monitoring/*.sh

# Check permissions on backup directory
sudo chmod 700 /backups/fit-freak
sudo chown backup-user:backup-user /backups/fit-freak
```

### Issue: "MongoDB connection failed"

**Solution**:
```bash
# Verify MongoDB is running
systemctl status mongod

# Start MongoDB if not running
sudo systemctl start mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"

# Verify environment variables
echo $MONGODB_HOST
echo $MONGODB_PORT
```

### Issue: "Insufficient disk space"

**Solution**:
```bash
# Check disk usage
df -h /backups

# Clean up old backups manually
rm /backups/fit-freak/daily/backup_*.tar.gz

# Adjust retention policy in backup.env
DAILY_RETENTION=5  # Reduce from 7 to 5 days
```

### Issue: "Backup file corrupted"

**Solution**:
```bash
# Verify backup integrity
tar -tzf /backups/fit-freak/daily/backup_*.tar.gz > /dev/null

# If corrupted, restore from older backup
ls -lh /backups/fit-freak/daily/*.tar.gz

# Use weekly or monthly backup if daily is corrupted
/home/user/fit-freak-app/backup/scripts/restore-database.sh \
  -b /backups/fit-freak/weekly/backup_*.tar.gz
```

---

## First-Time Setup Checklist

- [ ] Install MongoDB tools and required packages
- [ ] Create backup directory structure
- [ ] Configure backup.env with correct paths
- [ ] Configure alert-config.env with email/Slack
- [ ] Test MongoDB connection
- [ ] Run manual backup test
- [ ] Run backup verification test
- [ ] Run restore validation test
- [ ] Configure cron jobs
- [ ] Test email alerts
- [ ] Document MongoDB credentials (securely)
- [ ] Create disaster recovery runbook copy
- [ ] Brief team on backup procedures
- [ ] Schedule first restore drill

---

## Ongoing Maintenance

### Weekly Tasks
- [ ] Review backup logs
- [ ] Check disk usage
- [ ] Verify no backup errors

### Monthly Tasks
- [ ] Execute backup restore test
- [ ] Review retention policy
- [ ] Test restore procedures

### Quarterly Tasks
- [ ] Full disaster recovery drill
- [ ] Update runbook
- [ ] Train team members

### Annual Tasks
- [ ] Comprehensive system audit
- [ ] RTO/RPO review
- [ ] Update disaster recovery plan

---

## Production Deployment

### Pre-Deployment Checklist

- [ ] All scripts tested in staging
- [ ] Environment variables configured
- [ ] Cron jobs scheduled
- [ ] Monitoring and alerts active
- [ ] Team trained on procedures
- [ ] Documentation up to date
- [ ] Backup locations verified
- [ ] Disk space verified

### Deployment Steps

```bash
# 1. Deploy backup scripts
sudo cp -r /home/user/fit-freak-app/backup /backups/fit-freak/
sudo chown -R backup-user:backup-user /backups/fit-freak/
sudo chmod 755 /backups/fit-freak/scripts/*.sh
sudo chmod 755 /backups/fit-freak/tests/*.sh
sudo chmod 755 /backups/fit-freak/monitoring/*.sh

# 2. Set up cron jobs (see section above)
sudo crontab -e

# 3. Run initial backup
source /backups/fit-freak/backup.env
/backups/fit-freak/scripts/database-backup.sh daily

# 4. Verify backup
/backups/fit-freak/tests/backup-verification.sh

# 5. Monitor for issues
tail -f /backups/fit-freak/logs/backup-*.log
```

---

## Support and Escalation

### For Technical Issues
1. Check logs: `/backups/fit-freak/logs/`
2. Run health check: `/usr/local/bin/check-backups.sh`
3. Review runbook: `/home/user/fit-freak-app/backup/docs/`
4. Contact backup administrator

### Escalation
- Level 1: Backup Administrator
- Level 2: IT Manager
- Level 3: CTO/Director

---

## Additional Resources

- [Master Disaster Recovery Plan](./docs/MASTER-DISASTER-RECOVERY-PLAN.md)
- [Disaster Recovery Runbook](./docs/DISASTER-RECOVERY-RUNBOOK.md)
- [RTO/RPO Documentation](./docs/RTO-RPO-DOCUMENTATION.md)
- [MongoDB Backup Documentation](https://docs.mongodb.com/manual/core/backups/)

---

**Setup Guide Version**: 1.0
**Last Updated**: 2024
**Status**: Production Ready
