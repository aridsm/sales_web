import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppLabel from "@/app/components/AppLabel";

describe("AppLabel", () => {
  it("renders the children correctly", () => {
    render(<AppLabel>My Label</AppLabel>);
    const label = screen.getByText("My Label");
    expect(label).toBeInTheDocument();
    expect(label.tagName).toBe("LABEL");
  });

  it("applies the htmlFor attribute", () => {
    render(<AppLabel htmlFor="my-input">Input Label</AppLabel>);
    const label = screen.getByText("Input Label");
    expect(label).toHaveAttribute("for", "my-input");
  });
});
