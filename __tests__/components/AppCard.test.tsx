import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import AppCard from "@/app/components/AppCard";

describe("AppCard", () => {
  it("renders the children correctly", () => {
    render(
      <AppCard>
        <p>Card Content</p>
      </AppCard>,
    );
    const content = screen.getByText("Card Content");
    expect(content).toBeInTheDocument();
  });

  it("applies the custom className", () => {
    render(<AppCard data-testid="card" className="my-custom-class" />);
    const card = screen.getByTestId("card");
    expect(card).toHaveClass("my-custom-class");
  });

  it("passes other HTML attributes", () => {
    render(<AppCard data-testid="card" id="my-card" aria-label="Card" />);
    const card = screen.getByTestId("card");
    expect(card).toHaveAttribute("id", "my-card");
    expect(card).toHaveAttribute("aria-label", "Card");
  });
});
