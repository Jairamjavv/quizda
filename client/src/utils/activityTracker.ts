import { logger } from "./logger";

/**
 * ActivityTracker - Monitors user activity and manages idle timeout
 *
 * Features:
 * - Tracks mouse, keyboard, scroll, touch, and visibility events
 * - Debounces activity updates to prevent excessive writes
 * - Stores last activity in localStorage for cross-tab synchronization
 * - Emits events when activity is detected for session management
 */

// Configuration constants
const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const ACTIVITY_DEBOUNCE_MS = 60 * 1000; // 1 minute (don't update more often)
const CHECK_INTERVAL_MS = 60 * 1000; // Check every minute
const WARNING_THRESHOLD_MS = 28 * 60 * 1000; // Warn at 28 minutes

// LocalStorage keys
const LAST_ACTIVITY_KEY = "quizda:lastActivity";
const AUTH_EVENT_KEY = "quizda:authEvent";

export type ActivityEvent = "activity" | "idle-warning" | "idle-timeout";

export class ActivityTracker {
  private lastActivityTime: number = Date.now();
  private lastStorageUpdate: number = 0;
  private checkInterval: NodeJS.Timeout | null = null;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private listeners: Map<ActivityEvent, Set<() => void>> = new Map();
  private isWarningShown: boolean = false;
  private isEnabled: boolean = false;

  constructor() {
    this.initializeListeners();
  }

  /**
   * Start tracking user activity
   */
  start(): void {
    if (this.isEnabled) {
      logger.debug("ActivityTracker already running");
      return;
    }

    logger.info("Starting activity tracker");
    this.isEnabled = true;
    this.lastActivityTime = Date.now();
    this.updateLastActivity();
    this.attachEventListeners();
    this.startIdleChecker();
    this.listenForStorageEvents();
  }

  /**
   * Stop tracking (on logout)
   */
  stop(): void {
    if (!this.isEnabled) return;

    logger.info("Stopping activity tracker");
    this.isEnabled = false;
    this.detachEventListeners();
    this.stopIdleChecker();
    this.clearLastActivity();
  }

  /**
   * Get time since last activity in milliseconds
   */
  getIdleTime(): number {
    const storedActivity = this.getStoredActivity();
    const lastActivity = storedActivity || this.lastActivityTime;
    return Date.now() - lastActivity;
  }

  /**
   * Check if user is currently idle (>30 minutes)
   */
  isIdle(): boolean {
    return this.getIdleTime() > IDLE_TIMEOUT_MS;
  }

  /**
   * Check if warning should be shown (>28 minutes)
   */
  shouldShowWarning(): boolean {
    const idleTime = this.getIdleTime();
    return idleTime > WARNING_THRESHOLD_MS && idleTime < IDLE_TIMEOUT_MS;
  }

  /**
   * Get time remaining before idle timeout (in seconds)
   */
  getTimeRemaining(): number {
    const idleTime = this.getIdleTime();
    const remaining = IDLE_TIMEOUT_MS - idleTime;
    return Math.max(0, Math.floor(remaining / 1000));
  }

  /**
   * Subscribe to activity events
   */
  on(event: ActivityEvent, callback: () => void): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * Manually trigger activity update (e.g., on API calls)
   */
  recordActivity(): void {
    if (!this.isEnabled) return;
    this.handleActivity();
  }

  /**
   * Reset activity timer (e.g., when user clicks "Stay logged in")
   */
  resetTimer(): void {
    logger.info("Resetting idle timer");
    this.lastActivityTime = Date.now();
    this.updateLastActivity();
    this.isWarningShown = false;
    this.emit("activity");
  }

  // Private methods

  private initializeListeners(): void {
    this.listeners.set("activity", new Set());
    this.listeners.set("idle-warning", new Set());
    this.listeners.set("idle-timeout", new Set());
  }

  private handleActivity = (): void => {
    if (!this.isEnabled) return;

    const now = Date.now();
    this.lastActivityTime = now;
    this.isWarningShown = false;

    // Debounce storage updates to prevent excessive writes
    if (now - this.lastStorageUpdate > ACTIVITY_DEBOUNCE_MS) {
      this.updateLastActivity();
    } else {
      // Schedule update
      if (this.debounceTimeout) clearTimeout(this.debounceTimeout);
      this.debounceTimeout = setTimeout(() => {
        this.updateLastActivity();
      }, ACTIVITY_DEBOUNCE_MS);
    }

    this.emit("activity");
  };

  private updateLastActivity(): void {
    try {
      const now = Date.now();
      localStorage.setItem(LAST_ACTIVITY_KEY, now.toString());
      this.lastStorageUpdate = now;
      logger.debug("Activity timestamp updated", { timestamp: now });
    } catch (error) {
      logger.error("Failed to update activity in localStorage", error);
    }
  }

  private getStoredActivity(): number | null {
    try {
      const stored = localStorage.getItem(LAST_ACTIVITY_KEY);
      return stored ? parseInt(stored, 10) : null;
    } catch (error) {
      logger.error("Failed to read activity from localStorage", error);
      return null;
    }
  }

  private clearLastActivity(): void {
    try {
      localStorage.removeItem(LAST_ACTIVITY_KEY);
    } catch (error) {
      logger.error("Failed to clear activity from localStorage", error);
    }
  }

  private attachEventListeners(): void {
    // User interaction events
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.addEventListener(event, this.handleActivity, { passive: true });
    });

    // Page visibility change (user returns to tab)
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    logger.debug("Activity event listeners attached");
  }

  private detachEventListeners(): void {
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "scroll",
      "touchstart",
      "click",
    ];

    events.forEach((event) => {
      document.removeEventListener(event, this.handleActivity);
    });

    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange
    );

    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }

    logger.debug("Activity event listeners detached");
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible") {
      logger.debug("Tab became visible, checking session status");
      // User returned to tab - check if session is still valid
      if (this.isIdle()) {
        this.emit("idle-timeout");
      } else if (this.shouldShowWarning()) {
        this.emit("idle-warning");
      } else {
        this.handleActivity();
      }
    }
  };

  private startIdleChecker(): void {
    this.checkInterval = setInterval(() => {
      this.checkIdleStatus();
    }, CHECK_INTERVAL_MS);

    logger.debug("Idle checker started");
  }

  private stopIdleChecker(): void {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkIdleStatus(): void {
    if (!this.isEnabled) return;

    const idleTime = this.getIdleTime();
    const idleMinutes = Math.floor(idleTime / 60000);

    logger.debug("Checking idle status", { idleMinutes });

    // Idle timeout exceeded
    if (idleTime > IDLE_TIMEOUT_MS) {
      logger.warn("Idle timeout exceeded", { idleMinutes });
      this.emit("idle-timeout");
      return;
    }

    // Show warning
    if (idleTime > WARNING_THRESHOLD_MS && !this.isWarningShown) {
      logger.info("Showing idle warning", { idleMinutes });
      this.isWarningShown = true;
      this.emit("idle-warning");
    }
  }

  private listenForStorageEvents(): void {
    // Listen for activity updates from other tabs
    window.addEventListener("storage", (event) => {
      if (event.key === LAST_ACTIVITY_KEY && event.newValue) {
        const timestamp = parseInt(event.newValue, 10);
        if (timestamp > this.lastActivityTime) {
          logger.debug("Activity detected in another tab");
          this.lastActivityTime = timestamp;
          this.isWarningShown = false;
          this.emit("activity");
        }
      }

      // Listen for logout events from other tabs
      if (event.key === AUTH_EVENT_KEY && event.newValue === "logout") {
        logger.info("Logout detected in another tab");
        this.emit("idle-timeout"); // Treat as timeout to trigger logout
      }
    });
  }

  private emit(event: ActivityEvent): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => {
        try {
          callback();
        } catch (error) {
          logger.error(`Error in ${event} callback`, error);
        }
      });
    }
  }

  /**
   * Broadcast logout event to other tabs
   */
  broadcastLogout(): void {
    try {
      localStorage.setItem(AUTH_EVENT_KEY, "logout");
      // Clear immediately to allow re-triggers
      setTimeout(() => {
        localStorage.removeItem(AUTH_EVENT_KEY);
      }, 100);
    } catch (error) {
      logger.error("Failed to broadcast logout", error);
    }
  }
}

// Singleton instance
export const activityTracker = new ActivityTracker();
