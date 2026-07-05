"use client";

import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

/**
 * Lê parâmetros de filtro da URL e retorna um objeto flat.
 *
 * @param allowedKeys - Lista de chaves permitidas. Somente essas serão lidas da URL.
 *                      Chaves de paginação (page, page_size) e busca (search) são
 *                      adicionadas automaticamente.
 * @param keyMap - Mapa opcional para renomear chaves da URL antes de retornar.
 *                 Ex: { "start_product_created_at": "start_created_at" }
 */
export function useFilterParams(
  allowedKeys: string[],
  keyMap?: Record<string, string>,
): Record<string, string> {
  const searchParams = useSearchParams();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const keyMapKey = JSON.stringify(keyMap);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const allowedKey = JSON.stringify(allowedKeys);

  return useMemo(() => {
    const builtInKeys = ["page", "page_size", "search"];
    const allowed = new Set([...builtInKeys, ...allowedKeys]);
    const params: Record<string, string> = {};

    searchParams.forEach((value, key) => {
      if (!allowed.has(key) || !value) return;
      const mappedKey = keyMap?.[key] ?? key;
      params[mappedKey] = value;
    });

    return params;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, allowedKey, keyMapKey]);
}
