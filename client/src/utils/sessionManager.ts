import axios, { AxiosError } from "axios";
import type { InternalAxiosRequestConfig } from "axios";
import { logger } from "./logger";

interface TokenResponse {
  accessToken: string;
  csrfToken: string;
}

class SessionManager {
  private accessToken: string | null = null;
  private csrfToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: Array<(token: string) => void> = [];

  constructor() {
    this.setupInterceptors();
    this.loadCsrfFromStorage();
  }

  /**
   * Load CSRF token from localStorage on initialization
   * Note: Access token is kept in memory only for XSS protection
   */
  private loadCsrfFromStorage() {
    this.csrfToken = localStorage.getItem("csrfToken");
    // Access token is NOT loaded from localStorage to prevent XSS attacks
    // It will be set on login and kept in memory only
  }

  /**
   * Set Authorization header for all requests
   */
  private setAuthorizationHeader(token: string) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  /**
   * Set CSRF header for state-changing requests
   */
  private setCsrfHeader(token: string) {
    axios.defaults.headers.common["X-CSRF-Token"] = token;
  }

  /**
   * Setup axios interceptors for automatic token refresh
   */
  private setupInterceptors() {
    // Request interceptor: Add tokens to requests
    axios.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // Add access token
        if (this.accessToken && config.headers) {
          config.headers["Authorization"] = `Bearer ${this.accessToken}`;
        }

        // Add CSRF token for state-changing requests
        if (
          this.csrfToken &&
          config.method &&
          ["post", "put", "patch", "delete"].includes(
            config.method.toLowerCase()
          )
        ) {
          if (config.headers) {
            config.headers["X-CSRF-Token"] = this.csrfToken;
          }
        }

        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor: Handle token expiration and refresh
    axios.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<any>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle token expiration
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === "TOKEN_EXPIRED" &&
          !originalRequest._retry
        ) {
          if (this.isRefreshing) {
            // If already refreshing, queue this request
            return new Promise((resolve) => {
              this.refreshSubscribers.push((token: string) => {
                if (originalRequest.headers) {
                  originalRequest.headers["Authorization"] = `Bearer ${token}`;
                }
                resolve(axios(originalRequest));
              });
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            // Refresh the token
            const { accessToken, csrfToken } = await this.refreshToken();

            // Update the failed request with new token
            if (originalRequest.headers) {
              originalRequest.headers[
                "Authorization"
              ] = `Bearer ${accessToken}`;
            }

            // Retry all queued requests
            this.refreshSubscribers.forEach((callback) =>
              callback(accessToken)
            );
            this.refreshSubscribers = [];

            // Retry the original request
            return axios(originalRequest);
          } catch (refreshError) {
            logger.error("Token refresh failed", refreshError);
            this.clearSession();
            window.location.href = "/auth/login";
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle session expiration
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === "SESSION_EXPIRED"
        ) {
          logger.warn("Session expired");
          this.clearSession();
          window.location.href = "/auth/login";
        }

        // Handle suspicious activity
        if (
          error.response?.status === 401 &&
          error.response?.data?.code === "SUSPICIOUS_ACTIVITY"
        ) {
          logger.error("Suspicious activity detected");
          this.clearSession();
          alert("Suspicious activity detected. Please login again.");
          window.location.href = "/auth/login";
        }

        return Promise.reject(error);
      }
    );
  }

  /**
   * Set tokens after successful authentication
   */
  setTokens(accessToken: string, csrfToken: string) {
    this.accessToken = accessToken;
    this.csrfToken = csrfToken;

    // Store CSRF token in localStorage (less sensitive, needed for requests)
    // Access token kept in memory only to prevent XSS attacks
    localStorage.setItem("csrfToken", csrfToken);

    // Set headers
    this.setAuthorizationHeader(accessToken);
    this.setCsrfHeader(csrfToken);

    logger.info("Session tokens set successfully");
  }

  /**
   * Refresh access token using refresh token (HTTP-only cookie)
   */
  async refreshToken(): Promise<TokenResponse> {
    try {
      logger.info("Refreshing access token...");

      const response = await axios.post(
        "/auth/refresh",
        {},
        {
          withCredentials: true, // Include HTTP-only cookies
        }
      );

      const { accessToken, csrfToken } = response.data;
      this.setTokens(accessToken, csrfToken);

      logger.info("Access token refreshed successfully");
      return { accessToken, csrfToken };
    } catch (error) {
      logger.error("Failed to refresh token", error);
      throw error;
    }
  }

  /**
   * Clear session data (logout)
   */
  clearSession() {
    this.accessToken = null;
    this.csrfToken = null;

    // Only remove CSRF token (access token was never stored)
    localStorage.removeItem("csrfToken");
    localStorage.removeItem("token"); // Legacy token
    localStorage.removeItem("userEmail"); // Legacy email

    delete axios.defaults.headers.common["Authorization"];
    delete axios.defaults.headers.common["X-CSRF-Token"];

    logger.info("Session cleared");
  }

  /**
   * Get current access token
   */
  getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * Get current CSRF token
   */
  getCsrfToken(): string | null {
    return this.csrfToken;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  /**
   * Decode JWT token to get user info
   */
  decodeToken(token: string = this.accessToken || ""): any {
    if (!token) return null;

    try {
      const payload = token.split(".")[1];
      return JSON.parse(atob(payload));
    } catch (error) {
      logger.error("Failed to decode token", error);
      return null;
    }
  }

  /**
   * Get current user from token
   */
  getCurrentUser(): { id: number; email: string; role: string } | null {
    if (!this.accessToken) return null;

    const decoded = this.decodeToken(this.accessToken);
    return decoded
      ? {
          id: decoded.id,
          email: decoded.email,
          role: decoded.role,
        }
      : null;
  }

  /**
   * Check if token is expired
   */
  isTokenExpired(token: string = this.accessToken || ""): boolean {
    const decoded = this.decodeToken(token);
    if (!decoded || !decoded.exp) return true;

    const now = Date.now() / 1000;
    return decoded.exp < now;
  }

  /**
   * Auto-refresh token before expiration
   */
  startAutoRefresh(bufferSeconds: number = 60) {
    const checkInterval = 30000; // Check every 30 seconds

    setInterval(() => {
      if (!this.accessToken) return;

      const decoded = this.decodeToken(this.accessToken);
      if (!decoded || !decoded.exp) return;

      const now = Date.now() / 1000;
      const timeUntilExpiry = decoded.exp - now;

      // Refresh if less than buffer time remaining
      if (timeUntilExpiry > 0 && timeUntilExpiry < bufferSeconds) {
        logger.info("Auto-refreshing token", { timeUntilExpiry });
        this.refreshToken().catch((error) => {
          logger.error("Auto-refresh failed", error);
        });
      }
    }, checkInterval);
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Start auto-refresh
sessionManager.startAutoRefresh(60); // Refresh 1 minute before expiry
