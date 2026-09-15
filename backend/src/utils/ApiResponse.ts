export class ApiResponse<T = any> {
  public success: boolean;
  public message: string;
  public data?: T;

  constructor(message: string, data?: T, success: boolean = true) {
    this.success = success;
    this.message = message;
    if (data !== undefined) {
      this.data = data;
    }
  }

  static success<T>(message: string, data?: T): ApiResponse<T> {
    return new ApiResponse<T>(message, data, true);
  }

  static error(message: string, data?: any): ApiResponse {
    return new ApiResponse(message, data, false);
  }
}
