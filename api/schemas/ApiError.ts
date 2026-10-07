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
  detail?: string | ApiErrorDetail | Record<string, unknown>[];
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

  if (Array.isArray(detail)) {
    const first = detail[0];
    if (first && typeof first === "object") {
      const code =
        (first as Record<string, unknown>).error ||
        (first as Record<string, unknown>).msg ||
        (first as Record<string, unknown>).type;
      return { code: typeof code === "string" ? code : undefined };
    }
    return {};
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

  const message = axiosErr.response?.data?.message;
  if (typeof message === "string") {
    return { code: message };
  }

  return {};
}
