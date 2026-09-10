# Fit-Freak Backup and Disaster Recovery System

## Overview

A comprehensive backup, restore, and disaster recovery system for the Fit-Freak application. This system ensures:

- ✅ **30-minute recovery time** for database failures
- ✅ **24-hour maximum data loss** (RPO)
- ✅ **5-minute application rollback** for code issues
- ✅ **Automated daily backups** with verification
- ✅ **Multi-tier backup storage** (local, cloud, remote)
- ✅ **Continuous monitoring** and alerting
- ✅ **Disaster recovery runbook** with tested procedures

---

## Quick Start

### 1. Installation (5 minutes)

```bash
# Navigate to project root
cd /home/user/September-Release-/fit-freak-app

# Make scripts executable
chmod +x backup/scripts/*.sh
chmod +x backup/tests/*.sh
chmod +x backup/monitoring/*.sh

# Create backup directories
sudo mkdir -p /backups/fit-freak/{daily,weekly,monthly,config,safety,logs}
sudo chmod 700 /backups/fit-freak
```

### 2. Configuration (10 minutes)

```bash
# Copy and edit configuration
sudo cp backup/configs/backup.env.example /backups/fit-freak/backup.env
sudo nano /backups/fit-freak/backup.env

# Set up alerts
sudo cp backup/configs/alert-config.env.example /backups/fit-freak/alert-config.env
sudo nano /backups/fit-freak/alert-config.env
```

### 3. Run First Backup (5 minutes)

```bash
# Source environment
source /backups/fit-freak/backup.env

# Run daily backup
./backup/scripts/database-backup.sh daily

# Verify backup
./backup/tests/backup-verification.sh
```

### 4. Schedule Automated Backups (5 minutes)

```bash
# Add cron jobs
sudo crontab -e

# Add these lines:
0 2 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/database-backup.sh daily
30 2 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/config-backup.sh
0 3 * * 0 source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/scripts/database-backup.sh weekly
0 */6 * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/tests/backup-verification.sh
0 * * * * source /backups/fit-freak/backup.env && /home/user/fit-freak-app/backup/monitoring/backup-alerts.sh
```

See [SETUP_GUIDE.md](./SETUP_GUIDE.md) for detailed installation instructions.

---

## Directory Structure

```
backup/
├── scripts/                          # Backup execution scripts
│   ├── database-backup.sh            # Database backup automation
│   ├── config-backup.sh              # Configuration backup
│   ├── restore-database.sh           # Database restore procedures
│   └── code-rollback.sh              # Git-based code rollback
│
├── tests/                            # Testing and validation
│   ├── backup-verification.sh        # Backup integrity tests
│   └── restore-validation.sh         # Restore readiness validation
│
├── monitoring/                       # Alerting and monitoring
│   └── backup-alerts.sh              # Backup health monitoring
│
├── docs/                             # Documentation
│   ├── MASTER-DISASTER-RECOVERY-PLAN.md    # Complete DR plan
│   ├── DISASTER-RECOVERY-RUNBOOK.md        # Incident response procedures
│   └── RTO-RPO-DOCUMENTATION.md            # Recovery objectives
│
├── SETUP_GUIDE.md                   # Installation instructions
└── README.md                        # This file
```

---

## Core Functionality

### 1. Automated Backup System

#### Database Backups (MongoDB)
```bash
# Daily backup
./backup/scripts/database-backup.sh daily

# Weekly backup
./backup/scripts/database-backup.sh weekly

# Monthly backup
./backup/scripts/database-backup.sh monthly

# All backups
./backup/scripts/database-backup.sh all
```

**Backup Strategy**:
- Daily: Every 24 hours, retention 7 days
- Weekly: Every Sunday, retention 30 days
- Monthly: 1st of month, retention 365 days

#### Configuration Backup
```bash
# Backup application configuration
./backup/scripts/config-backup.sh
```

**Includes**:
- .env and .env.example
- package.json and package-lock.json
- Application configuration files
- Security settings (encrypted)

### 2. Database Recovery

#### Full Database Restore
```bash
# List available backups
ls -lh /backups/fit-freak/daily/

# Verify backup integrity
./backup/tests/restore-validation.sh \
  -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

# Perform restore
./backup/scripts/restore-database.sh \
  -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

# Test restore (dry run)
./backup/scripts/restore-database.sh \
  -D -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz
```

**Recovery Time**: ~30 minutes for full database

### 3. Application Recovery

#### Code Rollback
```bash
# Check current status
./backup/scripts/code-rollback.sh status

# Rollback to specific commit
./backup/scripts/code-rollback.sh commit abc1234

# Rollback to version tag
./backup/scripts/code-rollback.sh tag v1.0.0

# Rollback to branch
./backup/scripts/code-rollback.sh branch main

# Create checkpoint tag
./backup/scripts/code-rollback.sh create-tag v2.0-prod "Production release"
```

**Recovery Time**: ~5 minutes

#### Configuration Restoration
```bash
# Extract config backup
tar -xzf /backups/fit-freak/config/config_backup_LATEST.tar.gz

# Restore .env
cp extract/.env /app/.env

# Restart application
systemctl restart fit-freak-backend
```

**Recovery Time**: ~10 minutes

### 4. Backup Verification

#### Integrity Testing
```bash
# Run all verification tests
./backup/tests/backup-verification.sh
```

**Tests Performed**:
- Backup file integrity (tar.gz valid)
- Backup age (not older than 48 hours)
- Backup extraction (contents valid)
- Storage space (>20% free)
- Checksum verification
- Restore simulation
- Retention policy compliance

#### Restore Validation
```bash
# Validate backup before restore
./backup/tests/restore-validation.sh \
  -b /backups/fit-freak/daily/backup_LATEST.tar.gz
```

**Validation Checks**:
- Backup file completeness
- Required collections present
- Document structure valid
- Metadata integrity
- Database consistency

### 5. Monitoring and Alerts

#### Continuous Monitoring
```bash
# Run monitoring checks
./backup/monitoring/backup-alerts.sh
```

**Monitors**:
- Daily backup age and completeness
- Weekly backup status
- Monthly backup status
- Storage space usage
- Backup file integrity
- Configuration backup status
- Backup log errors

#### Alert Channels
- Email notifications
- Slack integration
- PagerDuty integration
- Log file records

---

## Recovery Time Objectives (RTO)

| Scenario | RTO | Procedure |
|----------|-----|-----------|
| **Database Single Node Failure** | 30 min | Restore from daily backup |
| **Code Deployment Error** | 5 min | Git rollback to previous version |
| **Configuration Error** | 10 min | Restore from config backup |
| **Data Corruption** | 2 hours | Point-in-time recovery + validation |
| **Complete Data Loss** | 4 hours | Full restore + integration tests |
| **Regional Failure** | 6 hours | Failover + restore in secondary region |

---

## Recovery Point Objectives (RPO)

| Backup Type | RPO | Schedule | Retention |
|-------------|-----|----------|-----------|
| Daily Backup | 24 hours | Every 24h (02:00 UTC) | 7 days |
| Weekly Backup | 7 days | Every Sunday (03:00 UTC) | 30 days |
| Monthly Backup | 30 days | 1st of month (04:00 UTC) | 365 days |
| Configuration | 24 hours | Every 24h (02:30 UTC) | 90 days |

---

## Disaster Recovery Procedures

### For Complete Database Loss

1. **Verify backup** (5 min)
   ```bash
   ./backup/tests/restore-validation.sh -b /backups/fit-freak/daily/LATEST.tar.gz
   ```

2. **Stop services** (1 min)
   ```bash
   systemctl stop fit-freak-backend
   ```

3. **Create safety backup** (5 min)
   ```bash
   mongodump --db fit-freak --out /backups/fit-freak/safety/pre-restore
   ```

4. **Execute restore** (15-20 min)
   ```bash
   ./backup/scripts/restore-database.sh -b /backups/fit-freak/daily/LATEST.tar.gz
   ```

5. **Verify data** (5 min)
   ```bash
   mongosh --eval "use fit-freak; db.users.countDocuments()"
   ```

6. **Start services** (1 min)
   ```bash
   systemctl start fit-freak-backend
   ```

7. **Validate** (5 min)
   ```bash
   npm run test:integration
   ```

**Total Time**: ~37-50 minutes

### For Code Deployment Error

1. **Detect issue** (2 min)
   ```bash
   npm run test:integration
   ```

2. **Prepare rollback** (1 min)
   ```bash
   ./backup/scripts/code-rollback.sh status
   ```

3. **Execute rollback** (2 min)
   ```bash
   ./backup/scripts/code-rollback.sh tag v1.0.0
   ```

4. **Reinstall dependencies** (5-10 min)
   ```bash
   npm install --production
   ```

5. **Restart** (1 min)
   ```bash
   systemctl restart fit-freak-backend
   ```

6. **Verify** (2 min)
   ```bash
   curl http://localhost:3000/api/health
   ```

**Total Time**: ~13-18 minutes

---

## Monitoring

### View Backup Status
```bash
# Check latest backups
ls -lh /backups/fit-freak/daily/
ls -lh /backups/fit-freak/weekly/
ls -lh /backups/fit-freak/monthly/

# Monitor active backups
ps aux | grep mongodump

# Check backup logs
tail -f /backups/fit-freak/logs/backup-$(date +%Y%m%d).log
```

### Key Metrics
- Backup completion: Monitor every 6 hours
- Backup age: Alert if > 48 hours
- Storage usage: Alert if > 85%
- Restore tests: Monthly drills
- Success rate: Track > 99%

### Health Check
```bash
# Run health check
/usr/local/bin/check-backups.sh

# Schedule as cron job
0 * * * * /usr/local/bin/check-backups.sh >> /var/log/backup-health.log 2>&1
```

---

## Testing Schedule

### Monthly Tests (First Monday, 10:00 UTC)
```bash
# Execute monthly backup restore test
./backup/tests/backup-verification.sh
./backup/tests/restore-validation.sh -b [latest-backup]
```

### Quarterly Drills (First Wednesday, 14:00 UTC)
```bash
# Full disaster recovery simulation
# 1. Backup current state
# 2. Simulate failure
# 3. Execute full recovery
# 4. Measure RTO achievement
# 5. Document results
```

### Annual Audit (Q1)
```bash
# Comprehensive system review
# - Audit all procedures
# - Review RTO/RPO achievement
# - Update documentation
# - Team training
# - Technology assessment
```

---

## Troubleshooting

### Backup Fails
1. Check MongoDB is running: `systemctl status mongod`
2. Verify disk space: `df -h /backups`
3. Check permissions: `ls -ld /backups/fit-freak`
4. Review logs: `tail -100 /backups/fit-freak/logs/backup-*.log`

### Restore Fails
1. Verify backup integrity: `tar -tzf backup_file.tar.gz`
2. Check disk space for extraction
3. Ensure MongoDB is running
4. Review restore logs: `tail -100 /backups/fit-freak/logs/restore-*.log`

### Alerts Not Sending
1. Check email config: `grep ALERT_EMAIL /backups/fit-freak/backup.env`
2. Test email: `echo "test" | mail -s "test" admin@example.com`
3. Verify Slack webhook if configured
4. Check alert script logs

---

## Configuration Files

### Main Configuration: `/backups/fit-freak/backup.env`
```bash
BACKUP_BASE_DIR=/backups/fit-freak
MONGODB_HOST=localhost
MONGODB_PORT=27017
MONGODB_DATABASE=fit-freak
DAILY_RETENTION=7
WEEKLY_RETENTION=30
MONTHLY_RETENTION=365
PROJECT_ROOT=/home/user/September-Release-/fit-freak-app
```

### Alert Configuration: `/backups/fit-freak/alert-config.env`
```bash
ALERT_EMAIL=admin@example.com
SLACK_WEBHOOK=https://hooks.slack.com/services/...
ALERT_STORAGE_THRESHOLD=85
```

---

## Documentation

| Document | Purpose |
|----------|---------|
| [SETUP_GUIDE.md](./SETUP_GUIDE.md) | Installation and configuration |
| [MASTER-DISASTER-RECOVERY-PLAN.md](./docs/MASTER-DISASTER-RECOVERY-PLAN.md) | Complete DR strategy and procedures |
| [DISASTER-RECOVERY-RUNBOOK.md](./docs/DISASTER-RECOVERY-RUNBOOK.md) | Step-by-step incident response |
| [RTO-RPO-DOCUMENTATION.md](./docs/RTO-RPO-DOCUMENTATION.md) | Recovery objectives and SLAs |

---

## Scripts Reference

### Backup Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `database-backup.sh` | Daily/weekly/monthly backups | `./database-backup.sh {daily\|weekly\|monthly\|all}` |
| `config-backup.sh` | Configuration and .env backups | `./config-backup.sh` |

### Restore Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `restore-database.sh` | Database restore from backup | `./restore-database.sh -b [file]` |
| `code-rollback.sh` | Git-based code rollback | `./code-rollback.sh {commit\|tag\|branch} [value]` |

### Test Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `backup-verification.sh` | Backup integrity tests | `./backup-verification.sh` |
| `restore-validation.sh` | Restore readiness checks | `./restore-validation.sh -b [file]` |

### Monitoring Scripts

| Script | Purpose | Usage |
|--------|---------|-------|
| `backup-alerts.sh` | Backup health monitoring | `./backup-alerts.sh` |

---

## Best Practices

1. **Test Regularly**: Monthly restore drills minimum
2. **Monitor Continuously**: Check backup completion daily
3. **Keep Updated**: Review and update runbooks quarterly
4. **Document Changes**: Log all recovery procedures
5. **Train Team**: Ensure all staff know procedures
6. **Verify Integrity**: Test backups before critical operations
7. **Multiple Locations**: Store backups in multiple locations
8. **Secure Backups**: Encrypt and restrict access
9. **Automate Monitoring**: Use alerting for early detection
10. **Plan for Failures**: Test worst-case scenarios

---

## Support

For issues or questions:

1. **Check Documentation**: Review relevant docs first
2. **Review Logs**: Check `/backups/fit-freak/logs/`
3. **Run Health Check**: Execute `/usr/local/bin/check-backups.sh`
4. **Contact Administrator**: Reach out to backup admin

---

## License and Terms

This backup and disaster recovery system is part of the Fit-Freak application.

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2024 | Initial release |

---

**Status**: Production Ready  
**Last Updated**: 2024  
**Maintenance**: Active
