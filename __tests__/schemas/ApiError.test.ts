import { describe, it, expect } from "vitest";
import { getApiError } from "@/api/schemas";

describe("getApiError", () => {
  it("retorna objeto vazio para null ou tipos primitivos", () => {
    expect(getApiError(null)).toEqual({});
    expect(getApiError(undefined)).toEqual({});
    expect(getApiError("erro string")).toEqual({});
    expect(getApiError(123)).toEqual({});
  });

  it("extrai erro quando detail é string", () => {
    const error = {
      response: {
        data: {
          detail: "errorInvalidCredentials",
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("errorInvalidCredentials");
    expect(result.params).toBeUndefined();
  });

  it("extrai código quando detail é objeto com error", () => {
    const error = {
      response: {
        data: {
          detail: {
            error: "errorCannotRemoveSelf",
          },
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("errorCannotRemoveSelf");
  });

  it("mapeia lista categories para name nos params", () => {
    const error = {
      response: {
        data: {
          detail: {
            error: "errorHasProducts",
            categories: ["Eletrônicos", "Roupas"],
          },
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("errorHasProducts");
    expect(result.params?.name).toEqual(["Eletrônicos", "Roupas"]);
  });

  it("mapeia lista products para name nos params", () => {
    const error = {
      response: {
        data: {
          detail: {
            error: "errorHasDoneSales",
            products: ["Camiseta Azul", "Calça Jeans"],
          },
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("errorHasDoneSales");
    expect(result.params?.name).toEqual(["Camiseta Azul", "Calça Jeans"]);
  });

  it("mapeia product_name para name nos params", () => {
    const error = {
      response: {
        data: {
          detail: {
            error: "errorInsufficientStock",
            product_name: "Tenis Esportivo",
          },
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("errorInsufficientStock");
    expect(result.params?.name).toBe("Tenis Esportivo");
    expect(result.params?.product_name).toBe("Tenis Esportivo");
  });

  it("extrai código quando detail é array de validação", () => {
    const error = {
      response: {
        data: {
          detail: [
            {
              type: "string_too_short",
              loc: ["body", "password"],
              msg: "String should have at least 6 characters",
            },
          ],
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("String should have at least 6 characters");
  });

  it("extrai message quando detail não existe mas message existe", () => {
    const error = {
      response: {
        data: {
          message: "Custom error message",
        },
      },
    };
    const result = getApiError(error);
    expect(result.code).toBe("Custom error message");
  });
});
