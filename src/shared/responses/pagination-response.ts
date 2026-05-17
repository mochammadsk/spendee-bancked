export class PaginationResponse<T> {
  success: boolean;
  message: string;
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };

  constructor({
    message,
    data,
    meta,
  }: {
    message: string;
    data: T[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }) {
    this.success = true;
    this.message = message;
    this.data = data;
    this.meta = meta;
  }
}
