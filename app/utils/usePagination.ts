import { useState, useCallback } from "react";

export interface PageData {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
}

export interface ApiResponse<T> {
  items: T[];
  page_size: number;
  page: number;
  total_items: number;
  total_pages: number;
}

export interface PaginationService<T> {
  getAll: (params?: Record<string, unknown>) => Promise<ApiResponse<T>>;
}

export interface PaginationResult<T> {
  items: T[];
  loading: boolean;
  load: (options?: {
    params?: Record<string, unknown>;
    append?: boolean;
    replace?: boolean;
  }) => Promise<void>;
  pageData: PageData;
  next: () => void;
  previous: () => void;
}

export function usePagination<T>(
  service: PaginationService<T>,
  defaultParams: Record<string, unknown> = {},
): PaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageData, setPageData] = useState<PageData>({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
  });
  const [params, setParams] = useState<Record<string, unknown>>({
    page: 1,
    page_size: 20,
    ...defaultParams,
  });

  const load = useCallback(
    async (options: {
      params?: Record<string, unknown>;
      append?: boolean;
      replace?: boolean;
    } = {}) => {
      const { params: newParams, append = false, replace = false } = options;
      const baseParams = replace
        ? { page: 1, page_size: 20, ...defaultParams }
        : params;
      const currentParams = newParams
        ? { ...baseParams, ...newParams }
        : baseParams;

      setParams(currentParams);
      setLoading(true);
      try {
        const response = await service.getAll(currentParams);
        if (append) {
          setItems((prev) => [...prev, ...response.items]);
        } else {
          setItems(response.items);
        }
        setPageData({
          page: response.page,
          page_size: response.page_size,
          total_items: response.total_items,
          total_pages: response.total_pages,
        });
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    },
    [service, params, defaultParams],
  );

  const next = useCallback(() => {
    setParams((prev) => ({ ...prev, page: (prev.page as number) + 1 }));
  }, []);

  const previous = useCallback(() => {
    setParams((prev) => ({
      ...prev,
      page: Math.max(1, (prev.page as number) - 1),
    }));
  }, []);

  return { items, loading, load, pageData, next, previous };
}
