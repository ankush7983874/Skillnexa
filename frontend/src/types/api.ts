export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any[];
}

export interface HealthStatus {
  success: boolean;
  message: string;
  timestamp: string;
  version: string;
}

export type UserRole = 'STUDENT' | 'COMPANY' | 'FACULTY' | 'INSTITUTION' | 'HOD' | 'ADMIN';
export type CompanyVerificationStatus = 'PENDING' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
