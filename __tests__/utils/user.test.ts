import { describe, it, expect } from "vitest";
import { getUserInitials, getUserColor } from "@/app/utils/user";

describe("getUserInitials", () => {
  it("retorna 'U' para valores nulos, indefinidos ou vazios", () => {
    expect(getUserInitials(null)).toBe("U");
    expect(getUserInitials(undefined)).toBe("U");
    expect(getUserInitials("")).toBe("U");
    expect(getUserInitials("   ")).toBe("U");
  });

  it("retorna uma inicial para nome simples", () => {
    expect(getUserInitials("Ana")).toBe("A");
  });

  it("retorna duas iniciais para nome composto", () => {
    expect(getUserInitials("Ana Paula")).toBe("AP");
    expect(getUserInitials("Carlos Eduardo Silva")).toBe("CE");
    expect(getUserInitials("Ana T")).toBe("AT");
  });
});

describe("getUserColor", () => {
  it("retorna cor padrão para valores nulos ou indefinidos", () => {
    expect(getUserColor(null)).toBe("bg-primary-3 text-white");
    expect(getUserColor(undefined)).toBe("bg-primary-3 text-white");
  });

  it("retorna uma cor consistente para o mesmo nome", () => {
    const color1 = getUserColor("Ana T");
    const color2 = getUserColor("Ana T");
    expect(color1).toBe(color2);
    expect(color1).toContain("text-white");
  });
});
