import { AxiosError } from "axios";

export interface ApiErrorDetail {
  error?: string;
  categories?: string[];
  products?: string[];
  product_name?: string;
  name?: string | string[];
  [key: string]: unknown;
}

export interface ApiErrorResponse {
  detail?: string | ApiErrorDetail;
  message?: string;
}

export type ApiError = AxiosError<ApiErrorResponse>;

/**
 * Extracts error code and interpolation parameters from an API/Axios error response.
 */
export function getApiError(err: unknown): {
  code?: string;
  params?: Record<string, unknown>;
} {
  if (!err || typeof err !== "object") return {};
  const axiosErr = err as ApiError;
  const detail = axiosErr.response?.data?.detail;

  if (typeof detail === "string") {
    return { code: detail };
  }

  if (detail && typeof detail === "object") {
    const { error, ...rest } = detail;
    const name =
      rest.categories || rest.products || rest.product_name || rest.name;

    return {
      code: error,
      params: {
        ...rest,
        ...(name !== undefined ? { name } : {}),
      },
    };
  }

  return {};
}
