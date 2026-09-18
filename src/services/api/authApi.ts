import { apiClient, ApiResponse } from './apiClient';

export interface UserProfile {
  id: string;
  userId: string;
  financialIQ: number;
  financialHealth: number;
  riskScore: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  profile?: UserProfile | null;
}

export interface AuthResponseData {
  user: User;
  tokens: {
    accessToken: string;
    expiresIn: string;
  };
}

export class AuthApi {
  public static async register(name: string, email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('/auth/register', { name, email, password });
    if (res.success && res.data?.tokens?.accessToken) {
      apiClient.setToken(res.data.tokens.accessToken);
      apiClient.setStoredUser(res.data.user);
    }
    return res;
  }

  public static async login(email: string, password: string): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('/auth/login', { email, password });
    if (res.success && res.data?.tokens?.accessToken) {
      apiClient.setToken(res.data.tokens.accessToken);
      apiClient.setStoredUser(res.data.user);
    }
    return res;
  }

  public static async guest(pilotCallsign?: string): Promise<ApiResponse<AuthResponseData>> {
    const res = await apiClient.post<AuthResponseData>('/auth/guest', { pilotCallsign });
    if (res.success && res.data?.tokens?.accessToken) {
      apiClient.setToken(res.data.tokens.accessToken);
      apiClient.setStoredUser(res.data.user);
    }
    return res;
  }

  public static async me(): Promise<ApiResponse<User>> {
    return apiClient.get<User>('/auth/me');
  }

  public static logout(): void {
    apiClient.removeToken();
  }

  public static getCurrentUser(): User | null {
    return apiClient.getStoredUser();
  }

  public static isAuthenticated(): boolean {
    return !!apiClient.getToken();
  }
}

