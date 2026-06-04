import { describe, it, expect } from "vitest";
import { currencyFormatter } from "@/app/utils/formatters/currency";

describe("currencyFormatter", () => {
  // ─────────────────────────────────────────────
  // mask: converte número/string para "R$ X.XXX,XX"
  // ─────────────────────────────────────────────
  describe("mask", () => {
    it("formata um número inteiro para BRL", () => {
      expect(currencyFormatter.mask(100)).toBe("R$\u00a0100,00");
    });

    it("formata um número decimal para BRL", () => {
      expect(currencyFormatter.mask(1234.56)).toBe("R$\u00a01.234,56");
    });

    it("formata zero corretamente", () => {
      expect(currencyFormatter.mask(0)).toBe("R$\u00a00,00");
    });

    it("formata número negativo", () => {
      expect(currencyFormatter.mask(-50)).toBe("-R$\u00a050,00");
    });

    it("aceita string numérica e formata", () => {
      expect(currencyFormatter.mask("250.75")).toBe("R$\u00a0250,75");
    });

    it("retorna string vazia para undefined", () => {
      expect(currencyFormatter.mask(undefined)).toBe("");
    });

    it("retorna string vazia para null", () => {
      expect(currencyFormatter.mask(null)).toBe("");
    });

    it("retorna string vazia para string vazia", () => {
      expect(currencyFormatter.mask("")).toBe("");
    });

    it("retorna string vazia para string não numérica", () => {
      expect(currencyFormatter.mask("abc")).toBe("");
    });
  });

  // ─────────────────────────────────────────────
  // unmask: converte "R$ X.XXX,XX" para número
  // ─────────────────────────────────────────────
  describe("unmask", () => {
    it("retorna 0 para undefined", () => {
      expect(currencyFormatter.unmask(undefined)).toBe(0);
    });

    it("retorna 0 para null", () => {
      expect(currencyFormatter.unmask(null)).toBe(0);
    });

    it("retorna 0 para string vazia", () => {
      expect(currencyFormatter.unmask("")).toBe(0);
    });

    it("retorna o próprio valor quando já é number", () => {
      expect(currencyFormatter.unmask(42.5)).toBe(42.5);
    });

    it("extrai número de string formatada com R$", () => {
      // "R$ 1.234,56" → dígitos "123456" / 100 = 1234.56
      expect(currencyFormatter.unmask("R$ 1.234,56")).toBe(1234.56);
    });

    it("extrai número de string formatada R$ simples", () => {
      expect(currencyFormatter.unmask("R$ 100,00")).toBe(100);
    });

    it("lida com string sem R$ no formato brasileiro", () => {
      // "1.234,56" → remove ponto de milhar, troca vírgula por ponto
      expect(currencyFormatter.unmask("1.234,56")).toBe(1234.56);
    });

    it("retorna 0 para string não numérica sem R$", () => {
      expect(currencyFormatter.unmask("abc")).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // formatInput: formata digitação em tempo real
  // ─────────────────────────────────────────────
  describe("formatInput", () => {
    it("formata dígitos brutos como centavos", () => {
      // "1234" → 12.34
      expect(currencyFormatter.formatInput("1234")).toBe("R$\u00a012,34");
    });

    it("formata string vazia como zero", () => {
      expect(currencyFormatter.formatInput("")).toBe("R$\u00a00,00");
    });

    it("ignora caracteres não numéricos", () => {
      expect(currencyFormatter.formatInput("abc123")).toBe("R$\u00a01,23");
    });

    it("formata valor grande com separador de milhar", () => {
      expect(currencyFormatter.formatInput("10000000")).toBe(
        "R$\u00a0100.000,00",
      );
    });
  });
});
