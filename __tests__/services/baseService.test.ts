import { describe, it, expect, vi, beforeEach } from "vitest";

// Mocka o axiosClient antes do import do BaseService
vi.mock("@/api/axiosClient", () => ({
  axiosClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { axiosClient } from "@/api/axiosClient";
import BaseService from "@/api/services/BaseService";

// Cria instância concreta para testes
interface TestEntity {
  id: string;
  name: string;
}
interface TestFormDto {
  name: string;
}

const service = new BaseService<TestEntity, TestFormDto>("products");

describe("BaseService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // getById
  // ─────────────────────────────────────────────
  describe("getById", () => {
    it("chama GET /products/{id} e retorna os dados", async () => {
      const mockProduct = { id: "abc-123", name: "Camiseta" };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockProduct });

      const result = await service.getById("abc-123");

      expect(axiosClient.get).toHaveBeenCalledWith("/products/abc-123");
      expect(axiosClient.get).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockProduct);
    });

    it("propaga erro da API para o chamador", async () => {
      vi.mocked(axiosClient.get).mockRejectedValue(new Error("Not Found"));

      await expect(service.getById("999")).rejects.toThrow("Not Found");
    });
  });

  // ─────────────────────────────────────────────
  // getAll
  // ─────────────────────────────────────────────
  describe("getAll", () => {
    it("chama GET /products com parâmetros de consulta", async () => {
      const mockResponse = { items: [], total: 0 };
      vi.mocked(axiosClient.get).mockResolvedValue({ data: mockResponse });

      const params = { page: 1, search: "camiseta" };
      const result = await service.getAll(params);

      expect(axiosClient.get).toHaveBeenCalledWith("/products", { params });
      expect(result).toEqual(mockResponse);
    });

    it("funciona sem parâmetros", async () => {
      vi.mocked(axiosClient.get).mockResolvedValue({ data: [] });

      await service.getAll();

      expect(axiosClient.get).toHaveBeenCalledWith("/products", {
        params: undefined,
      });
    });
  });

  // ─────────────────────────────────────────────
  // post
  // ─────────────────────────────────────────────
  describe("post", () => {
    it("envia POST /products com o payload e retorna a entidade criada", async () => {
      const input = { name: "Nova Camiseta" };
      const created = { id: "new-1", name: "Nova Camiseta" };
      vi.mocked(axiosClient.post).mockResolvedValue({ data: created });

      const result = await service.post(input);

      expect(axiosClient.post).toHaveBeenCalledWith("/products", input);
      expect(result).toEqual(created);
    });
  });

  // ─────────────────────────────────────────────
  // patch
  // ─────────────────────────────────────────────
  describe("patch", () => {
    it("envia PATCH /products/{id} com dados parciais", async () => {
      const updated = { id: "abc-123", name: "Camiseta Atualizada" };
      vi.mocked(axiosClient.patch).mockResolvedValue({ data: updated });

      const result = await service.patch("abc-123", {
        name: "Camiseta Atualizada",
      });

      expect(axiosClient.patch).toHaveBeenCalledWith("/products/abc-123", {
        name: "Camiseta Atualizada",
      });
      expect(result).toEqual(updated);
    });
  });

  // ─────────────────────────────────────────────
  // delete
  // ─────────────────────────────────────────────
  describe("delete", () => {
    it("envia DELETE /products/{id}", async () => {
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: undefined });

      await service.delete("abc-123");

      expect(axiosClient.delete).toHaveBeenCalledWith("/products/abc-123");
    });
  });

  // ─────────────────────────────────────────────
  // bulkDelete
  // ─────────────────────────────────────────────
  describe("bulkDelete", () => {
    it("envia DELETE /products/bulk com IDs no body (não na URL)", async () => {
      const ids = ["id-1", "id-2", "id-3"];
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: undefined });

      await service.bulkDelete(ids);

      expect(axiosClient.delete).toHaveBeenCalledWith("/products/bulk", {
        data: { ids },
      });
    });

    it("funciona com array vazio", async () => {
      vi.mocked(axiosClient.delete).mockResolvedValue({ data: undefined });

      await service.bulkDelete([]);

      expect(axiosClient.delete).toHaveBeenCalledWith("/products/bulk", {
        data: { ids: [] },
      });
    });
  });
});
