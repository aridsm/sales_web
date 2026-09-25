import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";
import AppCreatedBy from "@/app/components/AppCreatedBy";

describe("AppCreatedBy", () => {
  it("renderiza o avatar com as iniciais do autor", () => {
    render(
      <AppCreatedBy
        name="Ana T"
        date="2026-09-05T14:33:00Z"
        email="ana.t@empresa.com"
      />,
    );

    expect(screen.getByText("AT")).toBeInTheDocument();
    expect(screen.getByText(/Ana T em/)).toBeInTheDocument();
    expect(screen.getByText("ana.t@empresa.com")).toBeInTheDocument();
  });

  it("renderiza o email quando fornecido", () => {
    render(
      <AppCreatedBy
        name="Carlos"
        date="2026-09-05T14:33:00Z"
        email="carlos@empresa.com"
      />,
    );

    expect(screen.getByText("C")).toBeInTheDocument();
    expect(screen.getByText("carlos@empresa.com")).toBeInTheDocument();
  });

  it("renderiza a foto do autor quando avatarUrl for fornecido", () => {
    render(
      <AppCreatedBy
        name="Lucas"
        date="2026-09-05T14:33:00Z"
        avatarUrl="/uploads/avatars/lucas.png"
      />,
    );

    const img = screen.getByAltText("Lucas");
    expect(img).toBeInTheDocument();
  });
});
