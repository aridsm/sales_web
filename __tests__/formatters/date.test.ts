import { describe, it, expect } from "vitest";
import { parseUTCDate, formatDateTime } from "@/app/utils/formatters/date";

describe("parseUTCDate", () => {
  it("retorna null para null", () => {
    expect(parseUTCDate(null)).toBeNull();
  });

  it("retorna null para undefined", () => {
    expect(parseUTCDate(undefined)).toBeNull();
  });

  it("retorna null para string vazia", () => {
    expect(parseUTCDate("")).toBeNull();
  });

  it("adiciona Z a datetime sem timezone", () => {
    const date = parseUTCDate("2026-06-03T00:20:25.441092");
    // Deve interpretar como UTC, não como local
    expect(date).not.toBeNull();
    expect(date!.getUTCHours()).toBe(0);
    expect(date!.getUTCMinutes()).toBe(20);
    expect(date!.getUTCDate()).toBe(3);
  });

  it("não modifica datetime que já tem Z", () => {
    const date = parseUTCDate("2026-06-03T00:20:25.441092Z");
    expect(date).not.toBeNull();
    expect(date!.getUTCHours()).toBe(0);
    expect(date!.getUTCMinutes()).toBe(20);
  });

  it("não modifica datetime com offset positivo", () => {
    const date = parseUTCDate("2026-06-03T00:20:25+03:00");
    expect(date).not.toBeNull();
    // +03:00 significa que 00:20 local é 21:20 UTC do dia anterior
    expect(date!.getUTCHours()).toBe(21);
    expect(date!.getUTCDate()).toBe(2);
  });

  it("não modifica datetime com offset negativo", () => {
    const date = parseUTCDate("2026-06-03T10:00:00-03:00");
    expect(date).not.toBeNull();
    // -03:00 significa que 10:00 local é 13:00 UTC
    expect(date!.getUTCHours()).toBe(13);
  });

  it("trata datas sem componente de hora como-is", () => {
    // "2026-06-03" não contém "T", então deve ser tratado como-is
    // Nota: JS interpreta date-only strings como UTC meia-noite
    const date = parseUTCDate("2026-06-03");
    expect(date).not.toBeNull();
    expect(date!.getUTCFullYear()).toBe(2026);
    expect(date!.getUTCMonth()).toBe(5); // Junho = 5 (0-indexado)
    expect(date!.getUTCDate()).toBe(3);
  });
});

describe("formatDateTime", () => {
  it("retorna '-' para null", () => {
    expect(formatDateTime(null)).toBe("-");
  });

  it("retorna '-' para undefined", () => {
    expect(formatDateTime(undefined)).toBe("-");
  });

  it("retorna '-' para string vazia", () => {
    expect(formatDateTime("")).toBe("-");
  });

  it("retorna '-' para data inválida", () => {
    expect(formatDateTime("not-a-date")).toBe("-");
  });

  it("formata datetime UTC para pt-BR no fuso local", () => {
    // Usamos uma data com Z explícito para testar a formatação
    const result = formatDateTime("2026-01-15T14:30:00Z");
    expect(result).toBeDefined();
    expect(result).not.toBe("-");
    // O resultado conterá a data formatada no fuso local,
    // então verificamos que contém o padrão dd/mm/yyyy
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("formata datetime do servidor (sem Z) corretamente", () => {
    const result = formatDateTime("2026-06-03T00:20:25.441092");
    expect(result).toBeDefined();
    expect(result).not.toBe("-");
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("resultado contém hora e minuto", () => {
    const result = formatDateTime("2026-01-15T14:30:00Z");
    // Verifica padrão completo: dd/mm/yyyy, hh:mm
    expect(result).toMatch(/\d{2}\/\d{2}\/\d{4},?\s+\d{2}:\d{2}/);
  });
});
