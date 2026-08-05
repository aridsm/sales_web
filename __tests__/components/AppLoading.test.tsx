import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppLoading from "@/app/components/AppLoading";

describe("AppLoading", () => {
  it("renders correctly", () => {
    const { container } = render(<AppLoading />);
    // Since AppLoading doesn't have text, we test the DOM structure or styles
    const spinnerContainer = container.querySelector(".animate-\\[spin_2s_linear_infinite\\]");
    expect(spinnerContainer).toBeInTheDocument();
  });

  it("applies the custom className", () => {
    const { container } = render(<AppLoading className="my-custom-class" />);
    // The outermost div should have the custom className
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
