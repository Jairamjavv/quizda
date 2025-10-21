/**
 * Frontend Logger Utility
 * Provides structured logging for the React application
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogContext {
  [key: string]: any;
}

class FrontendLogger {
  private isDevelopment = import.meta.env.DEV;

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? JSON.stringify(context, null, 2) : "";
    return `[${timestamp}] [${level}] ${message}${
      contextStr ? "\n" + contextStr : ""
    }`;
  }

  private shouldLog(level: LogLevel): boolean {
    // In production, only log WARN and ERROR
    if (!this.isDevelopment && (level === "INFO" || level === "DEBUG")) {
      return false;
    }
    return true;
  }

  info(message: string, context?: LogContext) {
    if (this.shouldLog("INFO")) {
      console.log(
        `%c${this.formatMessage("INFO", message, context)}`,
        "color: #2196F3"
      );
    }
  }

  warn(message: string, context?: LogContext) {
    if (this.shouldLog("WARN")) {
      console.warn(
        `%c${this.formatMessage("WARN", message, context)}`,
        "color: #FF9800"
      );
    }
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    if (this.shouldLog("ERROR")) {
      const errorContext = {
        ...context,
        ...(error instanceof Error
          ? {
              errorMessage: error.message,
              errorStack: error.stack,
            }
          : { error }),
      };
      console.error(
        `%c${this.formatMessage("ERROR", message, errorContext)}`,
        "color: #F44336"
      );
    }
  }

  debug(message: string, context?: LogContext) {
    if (this.shouldLog("DEBUG")) {
      console.debug(
        `%c${this.formatMessage("DEBUG", message, context)}`,
        "color: #9E9E9E"
      );
    }
  }

  // API call logger
  apiCall(method: string, url: string, context?: LogContext) {
    this.debug(`API ${method}`, { url, ...context });
  }

  apiSuccess(
    method: string,
    url: string,
    statusCode: number,
    context?: LogContext
  ) {
    this.info(`API ${method} Success`, { url, statusCode, ...context });
  }

  apiError(method: string, url: string, error: any, context?: LogContext) {
    this.error(`API ${method} Failed`, error, { url, ...context });
  }

  // Authentication specific logs
  authAttempt(action: "login" | "register", email: string) {
    this.info(`Auth: ${action} attempt`, { email });
  }

  authSuccess(action: "login" | "register", email: string) {
    this.info(`Auth: ${action} successful`, { email });
  }

  authFailure(action: "login" | "register", error: any) {
    this.error(`Auth: ${action} failed`, error);
  }
}

export const logger = new FrontendLogger();
