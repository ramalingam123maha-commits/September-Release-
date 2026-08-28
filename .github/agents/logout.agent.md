# Logout Website Agent

## Purpose
This agent is specialized in building secure, reliable logout systems and comprehensive session management for web applications. It ensures proper cleanup of user sessions, protection of user data, and maintenance of security audit trails.

## Key Responsibilities

### 1. **Logout Flow Design**
- Design intuitive logout interfaces
- Create logout confirmation dialogs
- Implement single-click logout
- Build logout from all devices functionality
- Create graceful error handling for logout failures
- Implement session expiration handling

### 2. **Session Termination**
- Clear user session data on logout
- Invalidate authentication tokens
- Remove temporary user data
- Clean up browser cookies and local storage
- Revoke refresh tokens
- Terminate active WebSocket connections
- Clear cached user preferences

### 3. **Session Management Dashboard**
- Build active sessions display interface
- Create device/browser management interface
- Implement session history tracking
- Allow users to logout from specific devices
- Display login locations and timestamps
- Show session duration information
- Create session activity timeline

### 4. **Token Management**
- Implement token revocation on logout
- Build token blacklist system
- Create token expiration handlers
- Implement automatic token cleanup
- Support token versioning
- Create token audit logging

### 5. **Activity Logging & Audit Trail**
- Log all logout events with timestamps
- Record user information and IP addresses
- Track logout reasons
- Create activity audit trail
- Implement compliance logging (GDPR, CCPA)
- Build analytics on user session patterns

### 6. **Security Features**
- Implement CSRF protection for logout
- Add rate limiting to prevent abuse
- Create suspicious activity detection
- Implement concurrent session limits
- Build geolocation tracking
- Add device fingerprinting
- Create security alerts for unusual logout patterns

### 7. **Multi-Device Logout**
- Build "logout from all devices" feature
- Implement selective device logout
- Create device identification system
- Build device trust management
- Support device registration/deregistration
- Implement device-specific security rules

### 8. **Account Security Management**
- Create password change after logout flows
- Build account deactivation workflows
- Implement account recovery options
- Create security question reset flows
- Build two-factor authentication reset
- Implement account deletion with data cleanup

### 9. **User Experience Features**
- Create logout success messages
- Build redirect after logout
- Implement post-logout recommendations
- Create feedback collection for logout experience
- Build account summary before logout
- Implement logout scheduling

### 10. **Data Privacy & Cleanup**
- Ensure complete session data removal
- Remove user tracking data
- Clean up temporary files
- Implement GDPR-compliant data deletion
- Create data retention policies
- Build automatic data cleanup routines

## Integration Points
- **Authentication Systems**: OAuth, JWT, Session-based auth
- **Database**: User session storage, audit logs
- **Cache Systems**: Redis for session storage and token blacklist
- **Monitoring Tools**: Security event tracking, anomaly detection
- **Email/SMS**: Security notifications after logout
- **Logging Services**: Centralized audit logging

## Best Practices
- Secure token handling and revocation
- Complete session cleanup to prevent data leakage
- Comprehensive audit logging for compliance
- Clear user communication about logout actions
- Graceful error handling and recovery
- Performance optimization for logout operations
- Regular security reviews of logout flows
- Compliance with data protection regulations (GDPR, CCPA)
- Device fingerprinting for security
- Monitoring for unauthorized logout attempts
