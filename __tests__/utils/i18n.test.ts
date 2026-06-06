import { describe, it, expect, beforeEach } from "vitest";
import { getLabel, setLocale, getLocale } from "@/app/utils/i18n";

describe("i18n", () => {
  beforeEach(() => {
    setLocale("pt-BR");
  });

  describe("getLabel (tradução)", () => {
    it("busca mensagem de erro por rota e chave", () => {
      const result = getLabel("errors.categories.errorHasProducts", {
        name: ["Escrita"],
      });
      expect(result).toBe(
        "As seguintes categorias não podem ser excluídas porque possuem produtos vinculados: Escrita",
      );
    });

    it("interpola arrays com 'e' natural", () => {
      const result = getLabel("errors.categories.errorHasProducts", {
        name: ["Escrita", "Leitura", "Arte"],
      });
      expect(result).toContain(
        "As seguintes categorias não podem ser excluídas porque possuem produtos vinculados: Escrita, Leitura e Arte",
      );
    });

    it("interpola array com um único item sem 'e'", () => {
      const result = getLabel("errors.categories.errorHasProducts", {
        name: ["Escrita"],
      });
      expect(result).toContain("Escrita");
      expect(result).not.toContain(" e ");
    });

    it("retorna fallback genérico", () => {
      const result = getLabel("errors.fallback");
      expect(result).toBe("Ocorreu um erro inesperado. Tente novamente.");
    });

    it("retorna a chave crua se não encontrar tradução", () => {
      const result = getLabel("errors.categories.chaveInexistente");
      expect(result).toBe("errors.categories.chaveInexistente");
    });

    it("retorna a chave crua para caminho totalmente inválido", () => {
      const result = getLabel("foo.bar.baz");
      expect(result).toBe("foo.bar.baz");
    });

    it("mantém placeholder se parâmetro não for passado", () => {
      const result = getLabel("errors.categories.errorHasProducts");
      expect(result).toContain("{{name}}");
    });
  });

  describe("setLocale / getLocale", () => {
    it("inicia com pt-BR", () => {
      expect(getLocale()).toBe("pt-BR");
    });

    it("muda para en-US", () => {
      setLocale("en-US");
      expect(getLocale()).toBe("en-US");
    });

    it("retorna mensagem em inglês após trocar locale", () => {
      setLocale("en-US");
      const result = getLabel("errors.categories.errorHasProducts", {
        name: ["Writing"],
      });
      expect(result).toBe(
        "The following categories cannot be deleted because they have linked products: Writing",
      );
    });

    it("ignora locale inexistente", () => {
      setLocale("fr-FR");
      expect(getLocale()).toBe("pt-BR"); // mantém o anterior (resetado pelo beforeEach)
    });
  });
});
