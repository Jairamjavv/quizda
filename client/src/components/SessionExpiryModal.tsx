import React, { useState, useEffect } from 'react';
import { activityTracker } from '../utils/activityTracker';
import { sessionManager } from '../utils/sessionManager';
import { logger } from '../utils/logger';

interface SessionExpiryModalProps {
  onExtendSession?: () => void;
}

export const SessionExpiryModal: React.FC<SessionExpiryModalProps> = ({ onExtendSession }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(0);

  useEffect(() => {
    // Subscribe to idle warning event
    const unsubscribe = activityTracker.on('idle-warning', () => {
      logger.info('Session expiry warning triggered');
      setIsVisible(true);
    });

    // Subscribe to activity event to hide modal
    const unsubscribeActivity = activityTracker.on('activity', () => {
      if (isVisible) {
        logger.info('Activity detected, hiding expiry warning');
        setIsVisible(false);
      }
    });

    return () => {
      unsubscribe();
      unsubscribeActivity();
    };
  }, [isVisible]);

  // Update countdown every second when visible
  useEffect(() => {
    if (!isVisible) return;

    const interval = setInterval(() => {
      const remaining = activityTracker.getTimeRemaining();
      setTimeRemaining(remaining);

      // Auto-hide if time is up (will trigger logout separately)
      if (remaining <= 0) {
        setIsVisible(false);
      }
    }, 1000);

    // Set initial time
    setTimeRemaining(activityTracker.getTimeRemaining());

    return () => clearInterval(interval);
  }, [isVisible]);

  const handleStayLoggedIn = async () => {
    logger.info('User clicked Stay Logged In');
    setIsVisible(false);

    try {
      // Trigger a token refresh to extend the session
      await sessionManager.refreshToken();
      
      // Reset the activity timer
      activityTracker.resetTimer();
      
      logger.info('Session extended successfully');

      // Call optional callback
      if (onExtendSession) {
        onExtendSession();
      }
    } catch (error) {
      logger.error('Failed to extend session', error);
      // If refresh fails, user will be logged out automatically
    }
  };

  const handleLogout = () => {
    logger.info('User chose to logout from expiry warning');
    setIsVisible(false);
    // Logout will be triggered by idle timeout
  };

  if (!isVisible) return null;

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center mb-4">
          <svg
            className="w-6 h-6 text-yellow-500 mr-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Session Expiring Soon
          </h3>
        </div>

        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Your session will expire due to inactivity in:
        </p>

        <div className="flex items-center justify-center mb-6">
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg px-6 py-4">
            <div className="text-4xl font-bold text-gray-900 dark:text-white tabular-nums">
              {minutes}:{seconds.toString().padStart(2, '0')}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400 text-center mt-1">
              minutes remaining
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Click "Stay Logged In" to continue your session, or you'll be automatically logged out for security.
        </p>

        <div className="flex gap-3">
          <button
            onClick={handleLogout}
            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            Logout Now
          </button>
          <button
            onClick={handleStayLoggedIn}
            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
          >
            Stay Logged In
          </button>
        </div>

        <p className="text-xs text-gray-400 dark:text-gray-500 mt-4 text-center">
          Sessions expire after 30 minutes of inactivity for your security
        </p>
      </div>
    </div>
  );
};
