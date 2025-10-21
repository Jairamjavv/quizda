/**
 * Logger utility for structured logging
 * Logs are formatted for easy viewing in Render.com dashboard
 */

type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

interface LogContext {
  [key: string]: any;
}

class Logger {
  private formatMessage(
    level: LogLevel,
    message: string,
    context?: LogContext
  ): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` | ${JSON.stringify(context)}` : "";
    return `[${timestamp}] [${level}] ${message}${contextStr}`;
  }

  info(message: string, context?: LogContext) {
    console.log(this.formatMessage("INFO", message, context));
  }

  warn(message: string, context?: LogContext) {
    console.warn(this.formatMessage("WARN", message, context));
  }

  error(message: string, error?: Error | any, context?: LogContext) {
    const errorContext = {
      ...context,
      ...(error instanceof Error
        ? {
            errorMessage: error.message,
            errorStack: error.stack,
          }
        : { error }),
    };
    console.error(this.formatMessage("ERROR", message, errorContext));
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV !== "production") {
      console.debug(this.formatMessage("DEBUG", message, context));
    }
  }

  // Request logger middleware
  requestLogger(req: any, res: any, next: any) {
    const start = Date.now();

    // Log request
    this.info("Incoming request", {
      method: req.method,
      path: req.path,
      query: req.query,
      ip: req.ip,
      userAgent: req.get("user-agent"),
    });

    // Log response when finished
    res.on("finish", () => {
      const duration = Date.now() - start;
      const level = res.statusCode >= 400 ? "WARN" : "INFO";

      if (level === "WARN") {
        this.warn("Request completed with error", {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        });
      } else {
        this.info("Request completed", {
          method: req.method,
          path: req.path,
          statusCode: res.statusCode,
          duration: `${duration}ms`,
        });
      }
    });

    next();
  }
}

export const logger = new Logger();
