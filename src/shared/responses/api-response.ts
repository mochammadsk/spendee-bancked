export class ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;

  constructor({ success, message, data }: { success: boolean; message: string; data?: T }) {
    this.success = success;
    this.message = message;
    this.data = data;
  }

  static success<T>(message = 'Success', data?: T) {
    return new ApiResponse<T>({
      success: true,
      message,
      data,
    });
  }

  static error(message = 'Error') {
    return new ApiResponse({
      success: false,
      message,
    });
  }
}
