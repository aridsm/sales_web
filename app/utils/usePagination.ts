import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from "react";

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
  loaded: boolean;
  load: (options?: {
    params?: Record<string, unknown>;
    append?: boolean;
    replace?: boolean;
  }) => void;
  pageData: PageData;
  next: () => void;
  previous: () => void;
  setItems: Dispatch<SetStateAction<T[]>>;
}

export function usePagination<T>(
  service: PaginationService<T>,
  defaultParams: Record<string, unknown> = {},
): PaginationResult<T> {
  const [items, setItems] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [pageData, setPageData] = useState<PageData>({
    page: 1,
    page_size: 20,
    total_items: 0,
    total_pages: 0,
  });

  const [params, setParams] = useState<Record<string, unknown> | null>(null);

  const appendRef = useRef(false);

  const defaultParamsRef = useRef(defaultParams);
  const serviceRef = useRef(service);
  serviceRef.current = service;

  useEffect(() => {
    if (params === null) return;

    let cancelled = false;
    setLoading(true);

    serviceRef.current
      .getAll(params)
      .then((response) => {
        if (cancelled) return;
        if (appendRef.current) {
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
        setLoaded(true);
      })
      .catch((error) => {
        if (!cancelled) console.error("Error fetching data:", error);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  const load = useCallback(
    (
      options: {
        params?: Record<string, unknown>;
        append?: boolean;
        replace?: boolean;
      } = {},
    ) => {
      const { params: newParams, append = false, replace = false } = options;
      appendRef.current = append;

      setParams((prevParams) => {
        const base = prevParams ?? {
          page: 1,
          page_size: 20,
          ...defaultParamsRef.current,
        };
        const baseParams = replace
          ? { page: 1, page_size: 20, ...defaultParamsRef.current }
          : base;
        return newParams ? { ...baseParams, ...newParams } : { ...baseParams };
      });
    },
    [],
  );

  const next = useCallback(() => {
    setParams((prev) => {
      if (!prev) return prev;
      return { ...prev, page: (prev.page as number) + 1 };
    });
  }, []);

  const previous = useCallback(() => {
    setParams((prev) => {
      if (!prev) return prev;
      return { ...prev, page: Math.max(1, (prev.page as number) - 1) };
    });
  }, []);

  return { items, setItems, loading, loaded, load, pageData, next, previous };
}
