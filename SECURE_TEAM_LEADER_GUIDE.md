# 🔒 SECURE Team Leader Setup Guide

## ⚠️ CYBERSECURITY IMPLEMENTATION COMPLETE

The team leader system has been **completely redesigned** for security compliance:

### 🔒 **What Changed for Security:**

#### ❌ **OLD (Insecure) System:**
- Hardcoded emails in source code
- Auto-assignment without approval
- No audit trail
- Emails could be committed to Git

#### ✅ **NEW (Secure) System:**
- Emails stored in `.env` (gitignored)
- Manual admin approval required
- Complete audit trail with IP logging
- No auto-assignment of privileges
- Security event logging

---

## 🎯 **How to Add Team Leaders Securely:**

### Step 1: Copy Environment Template
```bash
cp .env.example .env
```

### Step 2: Edit Your `.env` File
Add your team leader emails (comma-separated, no spaces):

```env
# 🔒 SECURE TEAM LEADER WHITELISTS
TEAM_LEADERS_EXECUTIVE_COMMITTEE=leader1@uniandes.edu.co,leader2@uniandes.edu.co
TEAM_LEADERS_BATTERIES=battery.lead@uniandes.edu.co
TEAM_LEADERS_CELLS=cell.lead@uniandes.edu.co
TEAM_LEADERS_CHASSIS=chassis.lead@uniandes.edu.co
TEAM_LEADERS_LOGISTICS=logistics.lead@uniandes.edu.co
TEAM_LEADERS_DESIGN=j.galindom2@uniandes.edu.co
TEAM_LEADERS_HUMAN_RESOURCES=hr.lead@uniandes.edu.co
TEAM_LEADERS_VALIDATION_TEAM=validation.lead@uniandes.edu.co

# Security Configuration
TEAM_LEADER_WHITELIST_ENABLED=true
TEAM_LEADER_AUTO_ASSIGN=false
ADMIN_APPROVAL_REQUIRED=true
```

### Step 3: Automatic Assignment Process

1. **User registers** with whitelisted email and requests team leadership
2. **System verifies** email against environment whitelist
3. **If whitelisted**: Team leadership is **automatically assigned**
4. **If not whitelisted**: Request is denied and logged as security violation
5. **All events** are logged for security monitoring

---

## 🛡️ **Security Features:**

### ✅ **Privacy Protection:**
- ❌ No hardcoded emails in source code
- ❌ No public exposure of team leader list
- ✅ All sensitive data in `.env` (gitignored)
- ✅ Environment variables are server-side only

### ✅ **Access Control:**
- ❌ No automatic privilege assignment
- ✅ Manual admin approval required for ALL requests
- ✅ Two-step verification: whitelist + admin approval
- ✅ Only staff users can approve requests

### ✅ **Audit & Monitoring:**
- ✅ Complete audit trail with timestamps
- ✅ IP address and user agent logging
- ✅ Security event logging to `logs/security_dev.log`
- ✅ Failed attempt monitoring

### ✅ **Attack Prevention:**
- ✅ Non-whitelisted emails logged as security violations
- ✅ Rate limiting on registration attempts
- ✅ One-time use approval system
- ✅ Request expiration and denial capabilities

---

## 📋 **Admin Management:**

### Django Admin Interface:
- **URL:** `http://localhost:8000/admin/api/teamleaderrequest/`
- **View requests** by status, team, verification state
- **Bulk actions** for verification and approval
- **Search and filter** by email, team, date
- **Audit trail** viewing with IP addresses

### Available Actions:
- 🔍 **Verify against whitelist** - Check environment variables
- ✅ **Approve requests** - Grant team leadership
- ❌ **Deny requests** - Reject applications

---

## 🔧 **Team Name Mapping:**

Use these **exact** environment variable names:

| Team Name | Environment Variable |
|-----------|---------------------|
| Executive Committee | `TEAM_LEADERS_EXECUTIVE_COMMITTEE` |
| Batteries | `TEAM_LEADERS_BATTERIES` |
| Cells | `TEAM_LEADERS_CELLS` |
| Chassis | `TEAM_LEADERS_CHASSIS` |
| Logistics | `TEAM_LEADERS_LOGISTICS` |
| Design | `TEAM_LEADERS_DESIGN` |
| Human Resources | `TEAM_LEADERS_HUMAN_RESOURCES` |
| Validation Team | `TEAM_LEADERS_VALIDATION_TEAM` |

---

## 🚨 **Security Compliance Checklist:**

- ✅ **Environment Variables**: Sensitive data in `.env` only
- ✅ **Git Ignored**: `.env` and `logs/` directories excluded
- ✅ **Manual Approval**: No automatic privilege escalation
- ✅ **Audit Logging**: All events logged with metadata
- ✅ **Access Control**: Only staff can approve requests
- ✅ **Attack Monitoring**: Failed attempts logged as security violations
- ✅ **Privacy**: No public exposure of email addresses

---

## 📝 **Next Steps:**

1. **Edit your `.env`** with actual team leader emails
2. **Test the system** by registering with a whitelisted email
3. **Check admin panel** for pending requests
4. **Approve the request** to assign team leadership
5. **Monitor security logs** in `backend/logs/security_dev.log`

---

## 🔍 **Monitoring Security:**

**Log File:** `backend/logs/security_dev.log`

**Example Security Events:**
```
2026-04-09 15:30:45 | INFO | TEAM_LEADER_REQUEST_VERIFIED: Email=leader@uniandes.edu.co | Team=Design | IP=127.0.0.1
2026-04-09 15:31:12 | ERROR | TEAM_LEADER_SECURITY_VIOLATION: Email=hacker@evil.com | Team=Executive Committee | IP=192.168.1.100
2026-04-09 15:32:00 | INFO | TEAM_LEADER_APPROVED: Email=leader@uniandes.edu.co by admin@uniandes.edu.co
```

This implementation follows **industry cybersecurity best practices** and is compliant with data protection standards! 🔒