export interface ApiResponse<T = unknown> {
  code?: string | null;
  data: T;
  message: string;
  success: boolean;
}

/** MWAFQ upstream envelope: `{ value, isSuccess, isFailure, error }`. */
export interface UpstreamApiError {
  code: string;
  message: string;
}

export interface UpstreamApiResponse<T> {
  value: T;
  isSuccess: boolean;
  isFailure: boolean;
  error: UpstreamApiError;
}

/** Paginated list body (`pageNumber`, `data`, etc.) inside upstream `value`. */
export interface PaginatedResponse<T> {
  pageNumber: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
  data: T[];
}
