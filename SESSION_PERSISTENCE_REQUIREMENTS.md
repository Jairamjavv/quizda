# Session Persistence & Timeout Requirements

## Problem Statement

Users lose their session when closing the browser, requiring login every time. Need persistent sessions with proper timeout management.

## Current Behavior Analysis

### Issues Found:

1. **Access Token in Memory Only**: Lost on page refresh/browser close
2. **Refresh Token Cookie**: Set but maxAge depends on `rememberMe` flag
3. **Session Activity**: Database tracks `last_activity` but not actively used
4. **No Idle Timeout**: No client-side idle detection
5. **No Session Warnings**: Users don't know session is expiring

### Current Token Lifetimes:

- **Access Token**: 15 minutes (JWT expiry)
- **Refresh Token (rememberMe=false)**: 7 days (cookie maxAge)
- **Refresh Token (rememberMe=true)**: 30 days (cookie maxAge)
- **Session Record**: Based on `rememberMe` (12h or 30 days)

## Requirements

### 1. Session Persistence (Browser Close/Reopen)

- ✅ **MUST**: Users stay logged in after closing/reopening browser
- ✅ **MUST**: Work even without "Remember Me" checkbox
- ✅ **MUST**: Refresh token cookie persists across browser sessions
- ✅ **MUST**: Automatic token refresh on app startup

### 2. Idle Timeout (30 Minutes)

- ✅ **MUST**: Auto-logout after 30 minutes of inactivity
- ✅ **MUST**: Reset timer on any user interaction (click, scroll, API call)
- ✅ **MUST**: Detect activity across all tabs (same domain)
- ✅ **SHOULD**: Show warning before timeout (at 28 minutes)
- ✅ **SHOULD**: Offer "Stay logged in" button to extend session

### 3. Remember Me Feature

- ✅ **MUST**: Checkbox on login/register forms
- ✅ **MUST**: When unchecked: 30-minute idle timeout, 24-hour max session
- ✅ **MUST**: When checked: 30-minute idle timeout, 30-day max session
- ✅ **SHOULD**: Default to checked for better UX

### 4. Activity Tracking

- ✅ **MUST**: Track last activity timestamp in backend
- ✅ **MUST**: Update on every API call
- ✅ **MUST**: Validate idle time on token refresh
- ✅ **SHOULD**: Track in localStorage for client-side checks

### 5. Token Refresh Strategy

- ✅ **MUST**: Auto-refresh when access token expires (15 min)
- ✅ **MUST**: Validate idle timeout on refresh endpoint
- ✅ **MUST**: Reject refresh if >30 min idle
- ✅ **SHOULD**: Proactive refresh at 14 minutes if user active

### 6. Session Expiry Notifications

- ✅ **SHOULD**: Warning modal at 28 minutes idle
- ✅ **SHOULD**: Countdown timer showing remaining time
- ✅ **SHOULD**: "Stay logged in" button to refresh session
- ✅ **COULD**: Browser notification if page not focused

### 7. Multi-Tab Synchronization

- ✅ **SHOULD**: Logout in one tab = logout all tabs
- ✅ **SHOULD**: Activity in one tab = reset all tabs' timers
- ✅ **SHOULD**: Use localStorage events for tab communication
- ✅ **COULD**: Show "Logged in elsewhere" message

### 8. Security Considerations

- ✅ **MUST**: Validate device fingerprint hasn't changed
- ✅ **MUST**: Block refresh if suspicious activity detected
- ✅ **MUST**: Rate-limit token refresh endpoint
- ✅ **SHOULD**: Log all session extensions
- ✅ **SHOULD**: Alert on unusual activity patterns

## Technical Implementation Plan

### Phase 1: Backend Idle Timeout (Priority: HIGH)

1. Add idle timeout validation to `/auth/refresh` endpoint
2. Check `last_activity` vs current time
3. Reject refresh if >30 minutes idle
4. Return specific error code: `IDLE_TIMEOUT`

### Phase 2: Frontend Activity Tracking (Priority: HIGH)

1. Create `ActivityTracker` utility class
2. Track mouse, keyboard, scroll, touch events
3. Debounce activity updates (max 1 per minute)
4. Store `lastActivityTime` in localStorage
5. Sync across tabs using `storage` event

### Phase 3: Automatic Token Refresh (Priority: HIGH)

1. Add proactive refresh logic to sessionManager
2. Check token expiry every 60 seconds
3. Refresh at 14 minutes if user active
4. Cancel refresh if idle >30 minutes

### Phase 4: Idle Timeout Detection (Priority: MEDIUM)

1. Add interval checker (every 60 seconds)
2. Calculate idle time = current - lastActivity
3. Force logout at 30+ minutes
4. Show warning modal at 28 minutes

### Phase 5: Session Expiry UI (Priority: MEDIUM)

1. Create `SessionExpiryModal` component
2. Show countdown at 28 minutes
3. "Stay logged in" button = trigger token refresh
4. Auto-close on logout or activity

### Phase 6: Remember Me Enhancement (Priority: LOW)

1. Add checkbox to Login/Register forms
2. Pass `rememberMe` to auth endpoints
3. Update cookie maxAge accordingly
4. Store preference in user profile (optional)

### Phase 7: Multi-Tab Sync (Priority: LOW)

1. Use `localStorage.setItem('auth:event')` to broadcast
2. Listen with `window.addEventListener('storage')`
3. Sync logout events across tabs
4. Sync activity updates across tabs

### Phase 8: Testing & Polish (Priority: LOW)

1. Test all timeout scenarios
2. Test multi-tab behavior
3. Test network interruptions
4. Add comprehensive logging
5. Update documentation

## Success Criteria

### Must Have (MVP):

- [ ] User stays logged in after browser close/reopen
- [ ] Auto-logout after 30 minutes of no activity
- [ ] Token refresh fails if idle >30 minutes
- [ ] Session restored on app startup via refresh token

### Should Have:

- [ ] Warning modal before session expiry
- [ ] "Remember Me" checkbox functional
- [ ] Activity tracked and synced across tabs
- [ ] Logout propagates to all tabs

### Nice to Have:

- [ ] Browser notifications for expiry warnings
- [ ] Session extension history in user profile
- [ ] Admin dashboard for active sessions
- [ ] Graceful degradation if localStorage disabled

## Configuration Constants

```typescript
// Time constants
const ACCESS_TOKEN_LIFETIME = 15 * 60 * 1000; // 15 minutes
const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const SESSION_WARNING_TIME = 28 * 60 * 1000; // 28 minutes
const ACTIVITY_CHECK_INTERVAL = 60 * 1000; // 1 minute
const ACTIVITY_DEBOUNCE = 60 * 1000; // 1 minute
const MAX_SESSION_WITHOUT_REMEMBER = 24 * 60 * 60 * 1000; // 24 hours
const MAX_SESSION_WITH_REMEMBER = 30 * 24 * 60 * 60 * 1000; // 30 days

// Storage keys
const LAST_ACTIVITY_KEY = "quizda:lastActivity";
const AUTH_EVENT_KEY = "quizda:authEvent";
const REMEMBER_ME_KEY = "quizda:rememberMe";
```

## Implementation Priority

1. **CRITICAL** (Today):

   - Backend idle timeout validation
   - Frontend activity tracker
   - Auto token refresh on startup

2. **HIGH** (This Week):

   - Idle timeout detection & logout
   - Session expiry warning modal
   - Remember Me checkbox

3. **MEDIUM** (Next Week):

   - Multi-tab synchronization
   - Enhanced logging & monitoring
   - Comprehensive testing

4. **LOW** (Future):
   - Browser notifications
   - Session history UI
   - Advanced security features

## Risk Mitigation

### Risk 1: Clock Skew

- **Mitigation**: Use server timestamps, not client
- **Fallback**: Verify on every token refresh

### Risk 2: localStorage Disabled

- **Mitigation**: Fallback to in-memory tracking
- **Degradation**: No multi-tab sync

### Risk 3: Network Interruption

- **Mitigation**: Retry token refresh with backoff
- **Fallback**: Show "Offline" indicator

### Risk 4: Token Refresh Race Condition

- **Mitigation**: Use mutex pattern (already implemented)
- **Validation**: Extensive testing

## Monitoring & Metrics

Track in production:

1. Session duration distribution
2. Idle timeout frequency
3. Token refresh success rate
4. Session restoration success rate
5. Multi-tab sync effectiveness
6. Warning modal interaction rate

## Documentation Updates

1. User Guide: How sessions work
2. API Docs: New error codes
3. Developer Docs: Activity tracking API
4. FAQ: "Why was I logged out?"
