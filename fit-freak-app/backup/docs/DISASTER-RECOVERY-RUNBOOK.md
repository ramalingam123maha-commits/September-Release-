# Fit-Freak Disaster Recovery Runbook

## Document Information

- **Version**: 1.0
- **Last Updated**: 2024
- **Owner**: Backup Administrator
- **Status**: Active
- **Review Cycle**: Quarterly

---

## Table of Contents

1. [Quick Reference](#quick-reference)
2. [Disaster Classification](#disaster-classification)
3. [Incident Response Procedures](#incident-response-procedures)
4. [Recovery Procedures](#recovery-procedures)
5. [Rollback Procedures](#rollback-procedures)
6. [Post-Recovery Steps](#post-recovery-steps)
7. [Communication Plan](#communication-plan)
8. [Testing Schedule](#testing-schedule)

---

## Quick Reference

### Emergency Contacts

```
On-Call Engineer:      [Phone: ___________]
Backup Administrator:  [Phone: ___________]
Manager Escalation:    [Phone: ___________]
Vendor Support:        [Phone: ___________]
```

### Critical Backup Locations

```
Primary Backup:    /backups/fit-freak/daily/
Weekly Backup:     /backups/fit-freak/weekly/
Monthly Backup:    /backups/fit-freak/monthly/
Config Backup:     /backups/fit-freak/config/
Remote Backup:     s3://company-backups/fit-freak/
```

### Key Scripts Location

```
Database Backup:       /home/user/fit-freak-app/backup/scripts/database-backup.sh
Config Backup:         /home/user/fit-freak-app/backup/scripts/config-backup.sh
Database Restore:      /home/user/fit-freak-app/backup/scripts/restore-database.sh
Code Rollback:         /home/user/fit-freak-app/backup/scripts/code-rollback.sh
Backup Verification:   /home/user/fit-freak-app/backup/tests/backup-verification.sh
Restore Validation:    /home/user/fit-freak-app/backup/tests/restore-validation.sh
Monitoring Alerts:     /home/user/fit-freak-app/backup/monitoring/backup-alerts.sh
```

### Critical Files

```
MongoDB Connection:    Backend uses environment variables from .env
Database Name:         fit-freak
Collections:           users, workouts, goals
```

---

## Disaster Classification

### Level 1: Minor Incident (15-30 min RTO)

**Symptoms**:
- Single user unable to access feature
- Non-critical API endpoint failing
- Minor UI bug in specific component
- Short-lived performance degradation

**Examples**:
- Backend service restart needed
- Frontend cache clear needed
- Non-critical API endpoint error

**Initial Response**: 
- Try to restart affected component
- Check logs for errors
- No backup restore needed

---

### Level 2: Service Degradation (1-2 hour RTO)

**Symptoms**:
- Multiple users cannot use feature
- Partial API functionality lost
- Data accuracy issues with specific collection
- Performance degradation > 5 minutes

**Examples**:
- Configuration error in backend
- Deployment issue in frontend
- Corrupted collection in database

**Initial Response**:
- Alert backup team immediately
- Begin code rollback if deployment issue
- Prepare database restore if corruption detected
- Estimated RTO: 30-120 minutes

---

### Level 3: Major Outage (2-4 hour RTO)

**Symptoms**:
- Entire application unavailable
- Complete data loss for one collection
- Database unable to connect
- Multiple critical systems down

**Examples**:
- Database corruption
- Failed deployment affecting core services
- Server hardware failure
- Network connectivity loss

**Initial Response**:
- Declare disaster state
- Activate full disaster recovery team
- Execute full database restore
- Perform application rebuild if needed
- Estimated RTO: 2-4 hours

---

### Level 4: Catastrophic Failure (4+ hour RTO)

**Symptoms**:
- Complete application data loss
- Multiple data centers affected
- Unrecoverable hardware failure
- Extended network outage

**Examples**:
- Complete database corruption
- Data center destruction
- Multiple backup failures
- Ransomware attack

**Initial Response**:
- Activate executive escalation
- Execute full disaster recovery plan
- Coordinate with external stakeholders
- Begin parallel recovery attempts
- Estimated RTO: 4+ hours

---

## Incident Response Procedures

### Step 1: Detection and Notification (0-5 minutes)

**Who**: Monitoring system or on-call engineer

**Actions**:
```bash
# 1. Confirm incident
curl -X GET http://localhost:3000/api/health

# 2. Check system status
systemctl status fit-freak-backend
systemctl status fit-freak-frontend

# 3. Review recent logs
tail -f /var/log/fit-freak-backend.log
tail -f /var/log/fit-freak-frontend.log

# 4. Check database connectivity
mongosh --eval "db.adminCommand('ping')"

# 5. Notify on-call engineer
# [Send alert to on-call phone/email]
```

### Step 2: Initial Assessment (5-15 minutes)

**Who**: On-call engineer

**Assessment Checklist**:

```
[ ] Incident severity level (1-4)
[ ] Affected systems
[ ] Data integrity status
[ ] User impact estimate
[ ] Recovery approach
[ ] Estimated RTO
[ ] Escalation needed?
```

**Commands to Run**:

```bash
# Database status
mongosh --eval "db.stats()"

# Backup status
ls -lh /backups/fit-freak/daily/
ls -lh /backups/fit-freak/weekly/

# Recent backup verification
./backup/tests/backup-verification.sh

# Application logs
grep ERROR /var/log/fit-freak-backend.log | tail -20
```

### Step 3: Escalation (5-20 minutes)

**Decision Tree**:

```
Is application accessible?
├─ YES → Level 1 issue
│   └─ Try component restart first
│   └─ If fails after 10 min → Level 2
├─ NO, some data accessible?
│   └─ Level 2 issue
│   └─ Prepare code rollback
└─ NO, no data accessible?
    └─ Level 3/4 issue
    └─ Activate full disaster recovery
```

**Escalation Actions**:

```bash
# Level 2+ escalation
echo "INCIDENT: [Title]" | mail -s "DISASTER ALERT LEVEL 2+" admin@company.com

# Level 3+ escalation
# [Call manager and backup administrator]
# [Open war room meeting]
# [Begin formal incident tracking]
```

---

## Recovery Procedures

### Database Recovery: Corrupted Collection

**Severity**: Level 2-3
**Estimated Time**: 30-60 minutes

**Step-by-Step Procedure**:

```bash
# 1. Identify corrupted collection (2 min)
mongosh
> use fit-freak
> db.runCommand("collStats", "workouts")
> exit

# 2. Verify backup integrity (5 min)
./backup/tests/restore-validation.sh \
  -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

# 3. Stop application to prevent writes (1 min)
systemctl stop fit-freak-backend

# 4. Create safety backup (5 min)
mongodump --db fit-freak --out /backups/fit-freak/safety/pre-rollback

# 5. Drop corrupted collection (1 min)
mongosh
> use fit-freak
> db.workouts.drop()
> exit

# 6. Restore from backup (15-20 min)
./backup/scripts/restore-database.sh \
  -b /backups/fit-freak/daily/backup_20240101_120000.tar.gz

# 7. Verify restored data (5 min)
mongosh
> use fit-freak
> db.workouts.countDocuments()
> exit

# 8. Start application (1 min)
systemctl start fit-freak-backend

# 9. Run validation tests (5 min)
npm run test:integration

# 10. Monitor for issues (10 min)
tail -f /var/log/fit-freak-backend.log
```

**Verification**:

```bash
# Check data integrity
curl -X GET http://localhost:3000/api/workouts | jq '.length'

# Verify no errors
curl -X GET http://localhost:3000/api/health
```

**Rollback If Issues**:

```bash
# Restore from safety backup if needed
./backup/scripts/restore-database.sh \
  -b /backups/fit-freak/safety/pre-rollback
```

---

### Database Recovery: Complete Database Loss

**Severity**: Level 3-4
**Estimated Time**: 2-4 hours

**Step-by-Step Procedure**:

```bash
# 1. Declare disaster state (1 min)
# [Call incident commander]
# [Open war room]

# 2. Assess situation (5 min)
mongosh --eval "db.adminCommand('ping')" 2>&1 | grep -i error && echo "Database Down"

# 3. Verify backup availability (5 min)
ls -lh /backups/fit-freak/daily/
ls -lh /backups/fit-freak/weekly/
ls -lh /backups/fit-freak/monthly/

# 4. Select appropriate backup (5 min)
# Use most recent backup unless corruption detected
BACKUP_FILE="/backups/fit-freak/daily/backup_20240101_120000.tar.gz"

# 5. Validate backup (10 min)
./backup/tests/restore-validation.sh -b "${BACKUP_FILE}"

# 6. Prepare infrastructure (10 min)
# Ensure sufficient disk space
df -h /

# 7. Stop application (1 min)
systemctl stop fit-freak-backend

# 8. Perform test restore (30 min)
# Extract to temporary location first
./backup/scripts/restore-database.sh \
  -D -b "${BACKUP_FILE}"

# 9. Execute full restore (30-45 min)
./backup/scripts/restore-database.sh \
  -b "${BACKUP_FILE}"

# 10. Verify restoration (10 min)
mongosh
> use fit-freak
> db.users.countDocuments()
> db.workouts.countDocuments()
> db.goals.countDocuments()
> exit

# 11. Start application (1 min)
systemctl start fit-freak-backend

# 12. Run full test suite (15 min)
npm run test:integration

# 13. Monitor closely (20 min)
tail -f /var/log/fit-freak-backend.log
```

**Verification**:

```bash
# Functional tests
curl -X GET http://localhost:3000/api/health
curl -X GET http://localhost:3000/api/workouts | jq '.data | length'

# Application logs should show no errors
grep -c ERROR /var/log/fit-freak-backend.log
```

---

### Code Deployment Error Recovery

**Severity**: Level 2-3
**Estimated Time**: 5-30 minutes

**Quick Rollback Procedure**:

```bash
# 1. Detect deployment issue (2 min)
npm run test:integration 2>&1 | tail -20

# 2. Stop current application (1 min)
systemctl stop fit-freak-backend

# 3. List available versions (1 min)
./backup/scripts/code-rollback.sh list-commits 10

# 4. Rollback to previous working version (2 min)
# Option A: By commit hash
./backup/scripts/code-rollback.sh commit abc1234

# Option B: By tag
./backup/scripts/code-rollback.sh tag v1.0.0

# Option C: By branch
./backup/scripts/code-rollback.sh branch main

# 5. Reinstall dependencies (5-10 min)
npm install --production

# 6. Restart application (1 min)
systemctl start fit-freak-backend

# 7. Verify functionality (5 min)
curl -X GET http://localhost:3000/api/health
npm run test:integration

# 8. Monitor for errors (10 min)
tail -f /var/log/fit-freak-backend.log
```

---

### Configuration Error Recovery

**Severity**: Level 1-2
**Estimated Time**: 5-15 minutes

**Recovery Procedure**:

```bash
# 1. Identify config issue (5 min)
# Check logs for environment variable errors
grep "undefined\|not found\|missing" /var/log/fit-freak-backend.log

# 2. Restore from config backup (5 min)
cd /backups/fit-freak/config/
BACKUP_FILE=$(ls -t config_backup_*.tar.gz | head -1)
tar -xzf "${BACKUP_FILE}"
cp -v config_backup_*/backend/.env /app/

# 3. Verify .env file (1 min)
cat /app/.env | grep -E "MONGODB|API_PORT|JWT_SECRET"

# 4. Restart application (1 min)
systemctl restart fit-freak-backend

# 5. Test connectivity (2 min)
curl -X GET http://localhost:3000/api/health
```

---

## Rollback Procedures

### Automated Rollback: Git-Based

```bash
# Immediate rollback to previous commit
./backup/scripts/code-rollback.sh commit HEAD~1

# Rollback to specific version tag
./backup/scripts/code-rollback.sh tag v1.0.0

# Rollback to specific branch
./backup/scripts/code-rollback.sh branch main
```

### Manual Rollback: If Automated Fails

```bash
# 1. SSH to server
ssh user@production-server

# 2. Navigate to project
cd /home/user/fit-freak-app

# 3. Check git history
git log --oneline -10

# 4. Checkout specific commit
git checkout abc1234defgh

# 5. Reinstall and restart
npm install --production
systemctl restart fit-freak-backend

# 6. Verify
curl http://localhost:3000/api/health
```

---

## Post-Recovery Steps

### Immediate (0-30 minutes after recovery)

**Checklist**:

```
[ ] Application responding to requests
[ ] Database connectivity verified
[ ] No error logs being generated
[ ] Users can perform basic operations
[ ] API health endpoint returns 200
[ ] Frontend application loading
[ ] Authentication working
```

**Verification Commands**:

```bash
# API Health
curl -X GET http://localhost:3000/api/health

# Database Query
curl -X GET http://localhost:3000/api/workouts

# Frontend
curl -s http://localhost:5173 | head -20

# Application Logs
tail -f /var/log/fit-freak-backend.log
```

### Short-term (30 minutes - 2 hours after recovery)

**Activities**:

```
[ ] Run full integration test suite
[ ] Perform manual smoke testing
[ ] Verify all critical features
[ ] Check data accuracy
[ ] Monitor error rates
[ ] Update incident log
[ ] Notify stakeholders of recovery
```

**Commands**:

```bash
# Full test suite
npm run test:integration

# Monitor metrics
curl -X GET http://localhost:3000/api/metrics

# Check backup status
./backup/tests/backup-verification.sh
```

### Medium-term (2-24 hours after recovery)

**Activities**:

```
[ ] Root cause analysis
[ ] Update runbook with lessons learned
[ ] Verify backup integrity
[ ] Test restore procedures
[ ] Schedule post-mortem meeting
[ ] Review monitoring alerting
[ ] Implement preventive measures
```

### Long-term (24 hours - 7 days after recovery)

**Activities**:

```
[ ] Complete incident report
[ ] Present post-mortem findings
[ ] Implement action items
[ ] Update disaster recovery plan
[ ] Conduct team training
[ ] Audit backup retention
[ ] Optimize recovery procedures
```

---

## Communication Plan

### Incident Notification Template

```
INCIDENT NOTIFICATION
=====================
Date/Time: [YYYY-MM-DD HH:MM UTC]
Severity: [Level 1-4]
System: Fit-Freak Application
Status: [INVESTIGATING / IN PROGRESS / RESOLVED]

Summary:
[Brief description of issue]

Impact:
- Users affected: [number]
- Services down: [list services]
- Data at risk: [yes/no, estimate]

Actions Taken:
[List of immediate actions]

Estimated Resolution: [HH:MM UTC]
Next Update: [HH:MM UTC]

Contact: [escalation contact]
```

### Stakeholder Communication

**When to Notify**:
- Level 2+: Notify product team within 5 minutes
- Level 3+: Notify executive team within 15 minutes
- Level 4: Notify all stakeholders immediately

**Status Update Frequency**:
- Level 1: Optional updates
- Level 2: Every 15 minutes
- Level 3: Every 10 minutes
- Level 4: Every 5 minutes

---

## Testing Schedule

### Monthly Backup Restore Test

```bash
# First Monday of every month at 10:00 UTC
# 1. Select random daily backup
# 2. Perform restore to test database
# 3. Validate data integrity
# 4. Document results
# 5. Update procedures if needed

# Test command
./backup/tests/backup-verification.sh
./backup/tests/restore-validation.sh \
  -b /backups/fit-freak/daily/backup_LATEST.tar.gz
```

### Quarterly Disaster Recovery Drill

```bash
# First Wednesday of Q1, Q2, Q3, Q4 at 14:00 UTC
# 1. Simulate complete database loss
# 2. Execute full recovery procedure
# 3. Time the recovery
# 4. Document any issues
# 5. Train team on procedures

# Drill Checklist:
[ ] Notify team of drill (24 hours in advance)
[ ] Backup current state to safety location
[ ] Simulate failure
[ ] Execute recovery
[ ] Verify data integrity
[ ] Measure RTO achievement
[ ] Debrief and lessons learned
```

### Annual Comprehensive Audit

```bash
# Once per year (Q1)
# 1. Audit all backup procedures
# 2. Review RTO/RPO achievement
# 3. Update disaster recovery plan
# 4. Train new team members
# 5. Assess technology changes
# 6. Optimize recovery procedures
```

---

## Emergency Procedures

### If Disaster Recovery Scripts Fail

**Step 1: Manual Database Restore**

```bash
# Extract backup manually
mkdir /tmp/restore
cd /tmp/restore
tar -xzf /backups/fit-freak/daily/backup_LATEST.tar.gz

# Use mongorestore directly
mongorestore /tmp/restore/fit-freak --drop

# Verify
mongosh
> use fit-freak
> db.users.findOne()
```

**Step 2: Manual Code Rollback**

```bash
# Use git directly
cd /home/user/fit-freak-app
git log --oneline
git checkout abc1234

# Manual reinstall
rm -rf node_modules package-lock.json
npm install

# Restart
npm start
```

### If Backups Are Unavailable

**Last Resort Recovery**:

```bash
# 1. Check cloud backup
aws s3 ls s3://company-backups/fit-freak/

# 2. Check tape backups
# Contact backup administrator for tape access

# 3. Try database transactions log (if available)
# Review MongoDB oplog for recovery

# 4. Contact MongoDB support if corrupted
# Provide backup files and detailed error logs
```

---

## References

- [RTO-RPO Documentation](./RTO-RPO-DOCUMENTATION.md)
- [Backup Procedures Guide](../scripts/)
- [Monitoring Setup](../monitoring/)
- [Test Procedures](../tests/)

---

## Sign-Off

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Backup Administrator | _________ | _______ | _________ |
| IT Manager | _________ | _______ | _________ |
| Technical Lead | _________ | _______ | _________ |

---

**Document Status**: Active
**Last Review Date**: 2024
**Next Review Date**: Q4 2024
**Training Completion**: [Team members trained]
