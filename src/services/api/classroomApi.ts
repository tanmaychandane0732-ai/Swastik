import { apiClient, ApiResponse } from './apiClient';

export interface ClassroomCohortSummary {
  id: string;
  name: string;
  code: string;
  instructorName: string;
  totalStudents: number;
  averageIq: number;
  completionRate: number;
  archetypeBreakdown: Record<string, number>;
  leaderboard: Array<{
    rank: number;
    pilotName: string;
    netWorth: number;
    financialIq: number;
    archetype: string;
    status: string;
  }>;
}

export class ClassroomApi {
  public static async create(name: string, description?: string): Promise<ApiResponse<any>> {
    return apiClient.post('/classroom/create', { name, description });
  }

  public static async join(code: string): Promise<ApiResponse<any>> {
    return apiClient.post('/classroom/join', { code });
  }

  public static async getSummary(): Promise<ApiResponse<any>> {
    return apiClient.get('/classroom/cohort/summary');
  }

  public static async getCohort(id: string): Promise<ApiResponse<ClassroomCohortSummary>> {
    return apiClient.get<ClassroomCohortSummary>(`/classroom/${id}`);
  }
}

