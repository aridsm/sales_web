import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AppButton from "@/app/components/AppButton";

describe("AppButton", () => {
  it("renders with default props", () => {
    render(<AppButton>Click Me</AppButton>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeInTheDocument();
    // Default color is primary
    expect(button).toHaveClass("bg-primary");
    expect(button).toHaveClass("rounded-md");
  });

  it("handles clicks", () => {
    const handleClick = vi.fn();
    render(<AppButton onClick={handleClick}>Click Me</AppButton>);
    const button = screen.getByRole("button", { name: /click me/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("respects the disabled prop", () => {
    const handleClick = vi.fn();
    render(
      <AppButton disabled onClick={handleClick}>
        Disabled
      </AppButton>,
    );
    const button = screen.getByRole("button", { name: /disabled/i });
    expect(button).toBeDisabled();
    fireEvent.click(button);
    expect(handleClick).not.toHaveBeenCalled();
    expect(button).toHaveClass("disabled:opacity-50");
  });

  it("applies the flat class when flat is true", () => {
    render(<AppButton flat>Flat Button</AppButton>);
    const button = screen.getByRole("button", { name: /flat button/i });
    expect(button).toHaveClass("bg-transparent");
    expect(button).toHaveClass("text-primary");
  });

  it("applies the rounded class when rounded is true", () => {
    render(<AppButton rounded>Rounded Button</AppButton>);
    const button = screen.getByRole("button", { name: /rounded button/i });
    expect(button).toHaveClass("rounded-full");
  });

  it("applies the correct color classes", () => {
    const { rerender } = render(<AppButton color="red">Red</AppButton>);
    let button = screen.getByRole("button", { name: /red/i });
    expect(button).toHaveClass("bg-red-600/80");

    rerender(<AppButton color="foreground">Foreground</AppButton>);
    button = screen.getByRole("button", { name: /foreground/i });
    expect(button).toHaveClass("bg-foreground");
  });
});
