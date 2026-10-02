/**
 * FinQuest Centralized API Client
 * Connects to the Node.js/Express backend at http://localhost:5000/api.
 * Features:
 * - Automatic Bearer token attachment from localStorage
 * - Seamless offline fallback detection (never crashes UI if backend is offline)
 * - Standardized response unwrapping
 */

const API_BASE_URL =
  (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  'http://localhost:5000/api';

const TOKEN_KEY = 'finquest_pilot_token';
const USER_KEY = 'finquest_pilot_user';

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: {
    code: string;
    message: string;
  };
}

class ApiClient {
  private baseUrl: string;
  private backendAvailable: boolean | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  public setToken(token: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
  }

  public removeToken(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  public setStoredUser(user: any): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  public getStoredUser(): any | null {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(USER_KEY);
    if (!item) return null;
    try {
      return JSON.parse(item);
    } catch {
      return null;
    }
  }

  public async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${this.baseUrl}/health`, { method: 'GET' });
      this.backendAvailable = res.ok;
      return res.ok;
    } catch {
      this.backendAvailable = false;
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.backendAvailable !== false;
  }

  public async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: options.signal || controller.signal,
      }).finally(() => clearTimeout(timeoutId));

      const json = await response.json().catch(() => ({
        success: false,
        message: 'Non-JSON server response',
      }));

      if (!response.ok) {
        return {
          success: false,
          message: json.message || `Request failed with status ${response.status}`,
          data: json.data || null,
          error: json.error || { code: 'HTTP_ERROR', message: json.message || response.statusText },
        };
      }

      this.backendAvailable = true;
      return json;
    } catch (err: any) {
      // Backend unreachable or offline
      this.backendAvailable = false;
      return {
        success: false,
        message: 'Backend server currently offline. Local simulation fallback active.',
        data: null as any,
        error: {
          code: 'NETWORK_OFFLINE',
          message: err?.message || 'Failed to connect to backend server',
        },
      };
    }
  }

  public get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  public post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public put<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  public delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

